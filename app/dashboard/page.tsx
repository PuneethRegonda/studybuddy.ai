'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Sidebar from '@/app/ui/sidebar/sidebar';
import StudioPanel from '@/app/ui/studio-panel/studio-panel';
import UploadSourcesModal from '@/app/ui/modal/upload-source-modal';
import MainDisplay from '@/app/ui/main-display/main-display';

interface ContentData {
  focusScore: number;
  type: string;
  data: any;
  timestamp?: number;
}
import { sendFile } from "@/app/services/send-file"; // Make sure you import this


export default function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [currentData, setCurrentData] = useState<ContentData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(false); // New state to track if content is loaded
  const [attentionData, setAttentionData] = useState({
    attentionLevel: 75,
    shouldSwitchContent: false,
  });
  const [showBreakModal, setShowBreakModal] = useState(false); // New state for break modal
  const [currentSummaryText, setCurrentSummaryText] = useState<string>(''); // 🔥 summarized text



  const fetchContent = async () => {
    if (!selectedFile) {
      console.log('No file selected to refresh');
      return;
    }
  
    setIsLoading(true);
    setContentLoaded(false);
  
    try {
      console.log('Uploading and summarizing file...');
  
      // Upload file to backend
      const response = await sendFile(selectedFile, "http://127.0.0.1:5000/upload");
      const result = await response.json();
  
      console.log('Summarized content fetched:', result);
  
      // Save summarized text separately
      setCurrentSummaryText(result.data.content || '');
  
      if (!result.data.content) {
        console.warn('Warning: Summarized text is missing!');
        return;
      }
  
      // Save the initial learning content (summarized text)
      const contentData: ContentData = {
        focusScore: result.focusScore,
        type: result.type,
        data: result.data,
      };
  
      setCurrentData(contentData);
      setContentLoaded(true);
  
    } catch (error) {
      console.error('Error fetching content:', error);
      setContentLoaded(false);
    } finally {
      setIsLoading(false);
    }
  };
  


  const handleAttentionChange = useCallback(
    (data: {
      attentionLevel: number;
      shouldSwitchContent: boolean;
      suggestBreak?: boolean;
      suggestedContentType?: string;
      generatedContent?: any; 
    }) => {
      setAttentionData(data);
  
      if (currentData && data.shouldSwitchContent) {
        if (data.suggestBreak) {
          setShowBreakModal(true);
          const breakTimer = setTimeout(() => {
            setShowBreakModal(false);
          }, 5 * 60 * 1000);
          return () => clearTimeout(breakTimer);
        } else {
          if (data.generatedContent) {
            // 🔥 If generatedContent is provided (e.g., quiz, flashcards), update properly
            setCurrentData({
              focusScore: data.attentionLevel,
              type: data.generatedContent.type,
              data: data.generatedContent.data,
              timestamp: Date.now(),
            });
          } else if (data.suggestedContentType) {
            // fallback to old method
            updateContentToType(data.suggestedContentType);
          } else {
            updateContentType(data.attentionLevel);
          }
        }
      }
    },
    [currentData]
  );
  

  // New function to update content to a specific type
  const updateContentToType = useCallback(
    (newType: string) => {
      if (!currentData) return;

      // Only update if type is different
      if (newType !== currentData.type) {
        console.log(
          `Switching content type from ${currentData.type} to ${newType} based on suggestion`
        );

        // Update the currentData with the new type
        setCurrentData(prevData => {
          if (!prevData) return null;

          // Keep same data but change the type
          return {
            ...prevData,
            type: newType,
            timestamp: Date.now(),
          };
        });
      }
    },
    [currentData]
  );

  // Update content type based on attention level
  const updateContentType = useCallback(
    (attentionLevel: number) => {
      if (!currentData) return;

      // Determine new content type based on attention level
      let newType = '';
      if (attentionLevel > 80) {
        newType = 'text';
      } else if (attentionLevel > 60) {
        newType = 'mindmap';
      } else if (attentionLevel > 40) {
        newType = 'flipcard';
      } else if (attentionLevel > 20) {
        newType = 'quiz';
      } else {
        newType = 'react';
      }

      // Only update if type is different
      if (newType !== currentData.type) {
        if (attentionLevel > 80 && (currentData.type === 'mindmap' || currentData.type === 'flipcard' || currentData.type === 'quiz')) {
            console.log("High attention and good content format, not switching unnecessarily.");
            return; // 🛑 Stop here
        }
    
        console.log(`Switching content type from ${currentData.type} to ${newType} based on attention level ${attentionLevel}`);
        setCurrentData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            type: newType,
            timestamp: Date.now(),
          };
        });
    }
    
    },
    [currentData]
  );

  // Handle file upload
  const handleFileUpload = (files: File[]) => {
    const newFiles = [...files];
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Select the latest file
    const latestFile = newFiles[newFiles.length - 1];
    setSelectedFile(latestFile);
  };

  // Process newly uploaded files
  useEffect(() => {
    if (selectedFile) {
      fetchContent();
    }
  }, [selectedFile]);

  // Effect to handle attention data changes
  useEffect(() => {
    if (attentionData.shouldSwitchContent && currentData) {
      updateContentType(attentionData.attentionLevel);
    }
  }, [attentionData, currentData, updateContentType]);

  // Handle file selection from sidebar
  const handleFileView = (file: File) => {
    setSelectedFile(file);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <Sidebar
        onAddClick={() => setShowModal(true)}
        uploadedFiles={uploadedFiles}
        onFileView={handleFileView}
        selectedFile={selectedFile}
      />

      

      {/* Main Content Area */}
      <MainDisplay
        isLoading={isLoading}
        contentData={currentData}
        onUpload={() => setShowModal(true)}
      />
   
      {/* Right Studio Panel */}
      <StudioPanel
        onAttentionChange={handleAttentionChange}
        isContentLoaded={contentLoaded}
        currentContentType={currentData?.type || ''}
        currentSummaryText={currentSummaryText}   // 🔥 ADD THIS

      />

      {/* Upload Source Modal */}
      {showModal && (
        <UploadSourcesModal
          onClose={() => setShowModal(false)}
          handleFileUpload={handleFileUpload}
        />
      )}

      {/* Break Modal */}
      {showBreakModal && (
        <div className="break-modal">
          <p>Take a break! We'll remind you when it's time to return.</p>
          <button onClick={() => setShowBreakModal(false)}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
