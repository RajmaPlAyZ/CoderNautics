import GuidelinesSidebar from "@/components/guidelines-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function AddQuestionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center text-xl font-bold text-blue-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-6 w-6"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            CoderNautics
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="outline">Log In</Button>
            <Button>Sign Up</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Back to questions
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Add a New Question</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <GuidelinesSidebar />
          </div>
          <div className="md:col-span-3">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <form className="space-y-6">
                <div>
                  <label htmlFor="question-title" className="mb-2 block font-medium">
                    Question Title
                  </label>
                  <Input id="question-title" placeholder="E.g., How to reverse a list in Python?" className="w-full" />
                  <p className="mt-1 text-sm text-gray-500">
                    Be specific and imagine you're asking a question to another person.
                  </p>
                </div>

                <div>
                  <label htmlFor="code-snippet" className="mb-2 block font-medium">
                    Code Snippet
                  </label>
                  <textarea
                    id="code-snippet"
                    className="h-64 w-full rounded-md border border-gray-300 p-3 font-mono text-sm"
                    placeholder="# Your code here
def example_function():
    pass"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Include all relevant code. Format your code properly for readability.
                  </p>
                </div>

                <div>
                  <label htmlFor="explanation" className="mb-2 block font-medium">
                    Explanation / Answer
                  </label>
                  <textarea
                    id="explanation"
                    className="h-64 w-full rounded-md border border-gray-300 p-3 text-sm"
                    placeholder="Explain what your code does, what you're trying to achieve, and where you're stuck (if applicable)."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Provide context and explain your code in detail. If you already have an answer, include it here.
                  </p>
                </div>

                <div>
                  <label htmlFor="tags" className="mb-2 block font-medium">
                    Tags
                  </label>
                  <Input id="tags" placeholder="E.g., python, list, sorting" className="w-full" />
                  <p className="mt-1 text-sm text-gray-500">
                    Add up to 5 tags to describe what your question is about. Separate tags with commas.
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  Post Your Question
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t bg-white py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© 2025 CodeQ&A. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
