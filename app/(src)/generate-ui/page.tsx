'use client'

import React, { useState } from 'react'
import dynamic from 'next/dynamic'
import { Highlight, themes } from 'prism-react-renderer'

const GeneratedUIPreview = dynamic(() => import('@/components/GeneratedUIPreview'), { ssr: false })

export default function GenerateUi() {
  const [prompt, setPrompt] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt first')
      return
    }

    setLoading(true)
    setError(null)
    setGeneratedCode('')

    try {
      const response = await fetch('/api/generateui', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ body: prompt }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }
      setGeneratedCode(data.code)
    } catch (error: any) {
      console.error('Error', error)
      setError(`Code generation failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(generatedCode)
      .then(() => {
        const notification = document.getElementById('copyNotification')
        if (notification) {
          notification.classList.remove('hidden')
          setTimeout(() => notification.classList.add('hidden'), 2000)
        }
      })
      .catch((err) => console.error('Failed to copy: ', err))
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      <div className="max-w-4xl w-full flex-col items-center justify-center text-sm lg:flex">
        <h1 className="text-3xl text-blue-600 font-bold mb-8 text-center">
          UI Generator
        </h1>

        <div className="relative flex items-center w-full h-14 rounded-lg focus-within:shadow-lg bg-white overflow-hidden border border-blue-200">
          <input
            className="peer h-full w-full outline-none text-gray-200 pl-5 pr-14"
            type="text"
            placeholder="Enter a prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            aria-label="Enter a prompt for UI generation"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="absolute right-0 flex items-center justify-center h-full w-14 bg-blue-500 hover:bg-blue-600 text-white cursor-pointer transition-colors duration-300 disabled:bg-blue-300"
            aria-label="Generate UI"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            )}
          </button>
        </div>

        {error && (
          <p className="mt-4 text-red-500" role="alert">
            {error}
          </p>
        )}

        {generatedCode && (
          <>
            <div className="mt-8 w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl text-blue-600 font-semibold">
                  Generated UI:
                </h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-300"
                >
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </button>
              </div>
              
              {showPreview && <GeneratedUIPreview code={generatedCode} />}

              <h2 className="text-xl text-blue-600 font-semibold my-4">
                Generated Code:
              </h2>
              <div className="bg-white border-2 border-blue-200 rounded-lg p-4 shadow-md overflow-auto max-h-96">
                <Highlight
                  theme={themes.github}
                  code={generatedCode}
                  language="jsx"
                >
                  {({
                    className,
                    style,
                    tokens,
                    getLineProps,
                    getTokenProps,
                  }) => (
                    <pre className={className} style={style}>
                      {tokens.map((line, i) => (
                        <div key={i} {...getLineProps({ line, key: i })}>
                          {line.map((token, key) => (
                            <span
                              key={key}
                              {...getTokenProps({ token, key })}
                            />
                          ))}
                        </div>
                      ))}
                    </pre>
                  )}
                </Highlight>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md"
                onClick={handleCopyCode}
              >
                Copy Code
              </button>
            </div>
            <div
              id="copyNotification"
              className="hidden mt-4 p-2 bg-green-100 text-green-700 rounded-md"
            >
              Code copied to clipboard!
            </div>
          </>
        )}

        <div className="mt-8">
          <h2 className="text-md text-blue-500 font-semibold">Please Note:</h2>
          <p className="text-sm text-blue-600">
            This is just a beta version, sometimes the prompt might fail or the
            code might not be correct.
          </p>
          <p className="text-sm text-blue-600">
            We are currently working on improving this.
          </p>
          <p className="text-sm text-blue-600">Do give it a try though!</p>
          <p className="text-sm text-blue-600">
            If you spot any bugs or have any suggestions, hit us up on {" "}
            <a className="underline" href="https://www.linkedin.com/in/akshat-girdhar-56a848206/">
              Linkedin
            </a>{" "}
            or {" "}
            <a className="underline" href="https://x.com/AkshatGirdhar2">Twitter</a>
          </p>
        </div>
      </div>
    </main>
  )
}