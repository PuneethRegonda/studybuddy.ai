'use client';

import { FileText, LinkIcon } from 'lucide-react';
import SourceOption from './source-option';

export default function SourceOptions() {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {/* Google Drive */}
      <SourceOption
        name="Google Drive"
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 14L4 6H20L12 14Z" fill="#4285F4" />
            <path d="M4 6V18L8 14L4 6Z" fill="#34A853" />
            <path d="M20 6L16 14L20 18V6Z" fill="#FBBC05" />
            <path d="M8 14L12 18L16 14L12 14H8Z" fill="#EA4335" />
          </svg>
        }
      />

      {/* Google Docs */}
      <SourceOption
        name="Google Docs"
        icon={<FileText className="h-6 w-6 text-blue-500" />}
      />

      {/* Google Slides */}
      <SourceOption
        name="Google Slides"
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="4" y="4" width="16" height="16" rx="2" fill="#FBBC05" />
            <rect x="8" y="8" width="8" height="8" fill="white" />
          </svg>
        }
      />

      {/* Link */}
      <SourceOption
        name="Link"
        icon={<LinkIcon className="h-6 w-6 text-blue-500" />}
      />

      {/* YouTube */}
      <SourceOption
        name="YouTube"
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.5 6.5C22.3 5.9 22 5.4 21.6 5C21.2 4.6 20.7 4.3 20.1 4.1C18.4 3.5 12 3.5 12 3.5C12 3.5 5.6 3.5 3.9 4.1C3.3 4.3 2.8 4.6 2.4 5C2 5.4 1.7 5.9 1.5 6.5C0.9 8.2 0.9 12 0.9 12C0.9 12 0.9 15.8 1.5 17.5C1.7 18.1 2 18.6 2.4 19C2.8 19.4 3.3 19.7 3.9 19.9C5.6 20.5 12 20.5 12 20.5C12 20.5 18.4 20.5 20.1 19.9C20.7 19.7 21.2 19.4 21.6 19C22 18.6 22.3 18.1 22.5 17.5C23.1 15.8 23.1 12 23.1 12C23.1 12 23.1 8.2 22.5 6.5Z"
              fill="#FF0000"
            />
            <path d="M9.75 15.5L15.75 12L9.75 8.5V15.5Z" fill="white" />
          </svg>
        }
      />

      {/* Paste text */}
      <SourceOption
        name="Paste text"
        icon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V6C4 4.89543 4.89543 4 6 4H8"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="8"
              y="2"
              width="8"
              height="4"
              rx="1"
              stroke="black"
              strokeWidth="2"
            />
            <path
              d="M8 10H16"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M8 14H16"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        }
      />
    </div>
  );
}
