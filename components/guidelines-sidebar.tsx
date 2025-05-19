import { AlertTriangle, BookOpen, Search, Tag, Trophy } from "lucide-react"

export default function GuidelinesSidebar() {
  return (
    <div className="space-y-8 px-2 sm:px-0">
      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        .icon-shine {
          position: relative;
          overflow: hidden;
        }
        .icon-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          background-size: 200% 100%;
          animation: shine 4s infinite linear;
          pointer-events: none;
        }
      `}</style>

      <div className="rounded-xl border-2 border-black bg-gradient-to-br from-blue-50 to-blue-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
        <div className="mb-4 flex items-center gap-3 text-blue-600">
          <div className="rounded-lg bg-blue-100 p-2 transition-transform duration-300 hover:rotate-12 icon-shine">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg sm:text-xl">Community Guidelines</h3>
        </div>
        <div className="space-y-5 text-sm">
          <div>
            <h4 className="mb-3 font-semibold text-gray-900 text-base sm:text-lg">How to Add Questions</h4>
            <ol className="ml-5 list-decimal space-y-3 text-gray-700">
              <li className="pl-2 transition-all duration-300 hover:translate-x-1">
                <span className="font-semibold text-blue-700">Clear Title</span> - Summarize the problem/concept (e.g., "How to reverse
                a string in Python")
              </li>
              <li className="pl-2 transition-all duration-300 hover:translate-x-1">
                <span className="font-semibold text-blue-700">Complete Code</span> - Include executable code with proper formatting
              </li>
              <li className="pl-2 transition-all duration-300 hover:translate-x-1">
                <span className="font-semibold text-blue-700">Detailed Explanation</span> - Break down how the code works
              </li>
              <li className="pl-2 transition-all duration-300 hover:translate-x-1">
                <span className="font-semibold text-blue-700">Relevant Tags</span> - Add 3-5 tags (e.g., "python, string-manipulation")
              </li>
            </ol>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-black bg-gradient-to-br from-amber-50 to-yellow-50 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
        <div className="mb-4 flex items-center gap-3 text-amber-600">
          <div className="rounded-lg bg-amber-100 p-2 transition-transform duration-300 hover:rotate-12 icon-shine">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg sm:text-xl">Appropriate Content</h3>
        </div>
        <ul className="space-y-3 text-sm text-amber-700">
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-amber-500"></span>
            <span>No profanity, offensive language, or spam</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Questions should be programming-related</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Avoid duplicate questions (search first)</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-amber-500"></span>
            <span>No personal information or external links</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-amber-500"></span>
            <span>Use inclusive language</span>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border-2 border-black bg-gradient-to-br from-purple-50 to-purple-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
        <div className="mb-4 flex items-center gap-3 text-purple-600">
          <div className="rounded-lg bg-purple-100 p-2 transition-transform duration-300 hover:rotate-12 icon-shine">
            <Search className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg sm:text-xl">Finding Questions</h3>
        </div>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-purple-500"></span>
            <span>Search by keywords in titles or code</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-purple-500"></span>
            <span>Filter using specific tags</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-purple-500"></span>
            <span>Upvote useful questions to help others</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-purple-500"></span>
            <span>Report inappropriate content</span>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border-2 border-black bg-gradient-to-br from-green-50 to-green-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
        <div className="mb-4 flex items-center gap-3 text-green-600">
          <div className="rounded-lg bg-green-100 p-2 transition-transform duration-300 hover:rotate-12 icon-shine">
            <Tag className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg sm:text-xl">Tagging Guidelines</h3>
        </div>
        <ul className="space-y-3 text-sm text-gray-700">
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-green-500"></span>
            <span>Use language/framework names (python, react)</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-green-500"></span>
            <span>Include concepts (sorting, recursion)</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-green-500"></span>
            <span>Avoid overly broad tags (code, help)</span>
          </li>
          <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
            <span className="mt-1.5 block h-2 w-2 rounded-full bg-green-500"></span>
            <span>Maximum 5 tags per question</span>
          </li>
        </ul>
      </div>

      <div className="rounded-xl border-2 border-black bg-gradient-to-br from-indigo-50 to-indigo-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
        <div className="mb-4 flex items-center gap-3 text-indigo-600">
          <div className="rounded-lg bg-indigo-100 p-2 transition-transform duration-300 hover:rotate-12 icon-shine">
            <Trophy className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg sm:text-xl">Nautics Point System</h3>
        </div>
        <div className="space-y-5 text-sm">
          <div>
            <h4 className="mb-3 font-semibold text-gray-900 text-base">Earning Points</h4>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="mt-1.5 block h-2 w-2 rounded-full bg-indigo-500"></span>
                <span>Post a question: <span className="font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">+5 points</span></span>
              </li>
              <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="mt-1.5 block h-2 w-2 rounded-full bg-indigo-500"></span>
                <span>Answer a question: <span className="font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">+10 points</span></span>
              </li>
              <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="mt-1.5 block h-2 w-2 rounded-full bg-indigo-500"></span>
                <span>Receive an upvote: <span className="font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">+2 points</span></span>
              </li>
              <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="mt-1.5 block h-2 w-2 rounded-full bg-indigo-500"></span>
                <span>Marked as best answer: <span className="font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">+15 points</span></span>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-semibold text-gray-900 text-base">Point Tiers</h4>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="mt-1.5 block h-2 w-2 rounded-full bg-indigo-500"></span>
                <span><span className="font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">Novice</span>: 0-50 points</span>
              </li>
              <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="mt-1.5 block h-2 w-2 rounded-full bg-indigo-500"></span>
                <span><span className="font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">Explorer</span>: 51-200 points</span>
              </li>
              <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="mt-1.5 block h-2 w-2 rounded-full bg-indigo-500"></span>
                <span><span className="font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">Navigator</span>: 201-500 points</span>
              </li>
              <li className="flex items-start gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="mt-1.5 block h-2 w-2 rounded-full bg-indigo-500"></span>
                <span><span className="font-semibold text-indigo-600 transition-colors duration-300 hover:text-indigo-800">Captain</span>: 501+ points</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-xl border-2 border-black bg-gradient-to-br from-gray-50 to-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
        <h3 className="font-semibold mb-4 text-lg sm:text-xl">Good Question Example</h3>
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="mb-3 font-semibold text-gray-900 text-base">How to flatten a nested list in Python?</h4>
            <pre className="rounded-lg bg-gray-100 p-3 font-mono text-xs text-gray-800 shadow-inner transition-all duration-300 hover:bg-gray-200" style={{ whiteSpace: 'pre-wrap' }}>Code: [item for sublist in nested_list for item in sublist]</pre>
            <p className="mt-3 text-gray-700">Explanation: This list comprehension iterates through each sublist...</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-all duration-300 hover:bg-gray-200 hover:scale-110">python</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-all duration-300 hover:bg-gray-200 hover:scale-110">list comprehension</span>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition-all duration-300 hover:bg-gray-200 hover:scale-110">iteration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
