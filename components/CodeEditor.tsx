"use client";

import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white rounded-md">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
    </div>
  ),
});

type MonacoEditorProps = ComponentProps<typeof MonacoEditor>;

export default function CodeEditor(props: MonacoEditorProps) {
  return <MonacoEditor {...props} />;
}
