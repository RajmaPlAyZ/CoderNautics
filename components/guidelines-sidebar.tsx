import { AlertTriangle, BookOpen, Search, Tag } from "lucide-react"

export default function GuidelinesSidebar() {
  return (
    <div className="space-y-6 px-2 sm:px-0">
      <div className="rounded-lg border-2 border-black bg-blue-100 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-blue-600">
          <BookOpen className="h-5 w-5" />
          <h3 className="font-medium text-base sm:text-lg">Community Guidelines</h3>
        </div>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="mb-2 font-medium text-gray-900 text-sm sm:text-base">How to Add Questions</h4>
            <ol className="ml-5 list-decimal space-y-2 text-gray-700">
              <li>
                <span className="font-medium">Clear Title</span> - Summarize the problem/concept (e.g., "How to reverse
                a string in Python")
              </li>
              <li>
                <span className="font-medium">Complete Code</span> - Include executable code with proper formatting
              </li>
              <li>
                <span className="font-medium">Detailed Explanation</span> - Break down how the code works
              </li>
              <li>
                <span className="font-medium">Relevant Tags</span> - Add 3-5 tags (e.g., "python, string-manipulation")
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="rounded-lg border-2 border-black bg-yellow-50 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-medium text-base sm:text-lg">Appropriate Content</h3>
        </div>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-amber-500"></span>
            No profanity, offensive language, or spam
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-amber-500"></span>
            Questions should be programming-related
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-amber-500"></span>
            Avoid duplicate questions (search first)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-amber-500"></span>
            No personal information or external links
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-amber-500"></span>
            Use inclusive language
          </li>
        </ul>
      </div>

      <div className="rounded-lg border-2 border-black bg-purple-100 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-purple-600">
          <Search className="h-5 w-5" />
          <h3 className="font-medium text-base sm:text-lg">Finding Questions</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-purple-500"></span>
            Search by keywords in titles or code
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-purple-500"></span>
            Filter using specific tags
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-purple-500"></span>
            Upvote useful questions to help others
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-purple-500"></span>
            Report inappropriate content
          </li>
        </ul>
      </div>

      <div className="rounded-lg border-2 border-black bg-green-100 p-4 sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-green-600">
          <Tag className="h-5 w-5" />
          <h3 className="font-medium text-base sm:text-lg">Tagging Guidelines</h3>
        </div>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-green-500"></span>
            Use language/framework names (python, react)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-green-500"></span>
            Include concepts (sorting, recursion)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-green-500"></span>
            Avoid overly broad tags (code, help)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 block h-1 w-1 rounded-full bg-green-500"></span>
            Maximum 5 tags per question
          </li>
        </ul>
      </div>

      <div className="rounded-lg border-2 border-black bg-white p-4 sm:p-5">
        <h3 className="font-medium mb-3 text-base sm:text-lg">Good Question Example</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="mb-2 font-medium text-gray-900">How to flatten a nested list in Python?</h4>
            <pre className="rounded-md bg-gray-100 p-2 font-mono text-xs text-gray-800" style={{ whiteSpace: 'pre-wrap' }}>Code: [item for sublist in nested_list for item in sublist]</pre>
            <p className="mt-2 text-gray-700">Explanation: This list comprehension iterates through each sublist...</p>
            <p className="mt-2 text-gray-700">Tags: python, list comprehension, iteration</p>
          </div>
        </div>
      </div>
    </div>
  )
}
