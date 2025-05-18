import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea'; // Assuming you'll need Textarea for code/answer
import { useState } from 'react';

interface PostEditRowProps {
  post: {
    id: string;
    title: string;
    code?: string;
    answer?: string;
    tags?: string[];
    // Include other necessary post properties, but typically only editable ones are needed here
  };
  onSave: (updatedPost: {
    id: string;
    title: string;
    code?: string;
    answer?: string;
    tags?: string[];
  }) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export default function PostEditRow({ post, onSave, onCancel, isSaving }: PostEditRowProps) {
  const [editedPost, setEditedPost] = useState(post);
  const [editedTagsString, setEditedTagsString] = useState(post.tags?.join(', ') || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPost(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setEditedTagsString(e.target.value);
  }

  const handleSave = () => {
    const tagsArray = editedTagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    onSave({ ...editedPost, tags: tagsArray });
  };

  return (
    <tr key={post.id} className="bg-blue-50"> {/* Highlight row being edited */}
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <input
          type="text"
          name="title"
          value={editedPost.title}
          onChange={handleChange}
          className="text-xs sm:text-sm font-medium text-gray-900 font-comic w-full border rounded px-2 py-1"
          placeholder="Post Title"
        />
      </td>
      {/* Author and Date are not typically edited inline, display them as is or omit */}
       <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 font-comic">
          {/* Display author name here if available in the post object */}
          {/* post.user?.username || 'Anonymous' */ 'Author Name'} {/* Placeholder */}
      </td>
       <td className="px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500 font-comic">
          {/* Display date here */ 'Date'} {/* Placeholder */}
      </td>
      <td className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col space-y-2">
           {editedPost.code !== undefined && (
            <Textarea
                name="code"
                value={editedPost.code || ''}
                onChange={handleChange}
                className="text-xs sm:text-sm font-mono w-full border rounded px-2 py-1"
                placeholder="Code Snippet"
                rows={4}
              />
          )}
           {editedPost.answer !== undefined && (
             <Textarea
                name="answer"
                value={editedPost.answer || ''}
                onChange={handleChange}
                className="text-xs sm:text-sm w-full border rounded px-2 py-1"
                placeholder="Answer"
                 rows={4}
              />
          )}
           {editedPost.tags !== undefined && (
             <input
                type="text"
                name="tags"
                value={editedTagsString}
                onChange={handleTagsChange}
                className="text-xs sm:text-sm font-comic w-full border rounded px-2 py-1"
                placeholder="Tags (comma-separated)"
              />
          )}
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-green-500 hover:bg-green-600 text-white font-bold text-xs sm:text-sm border-2 border-black shadow-[0_2px_0_#222]"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
           <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="font-bold text-xs sm:text-sm border-2 border-black shadow-[0_2px_0_#222]"
          >
            Cancel
          </Button>
        </div>
      </td>
    </tr>
  );
} 