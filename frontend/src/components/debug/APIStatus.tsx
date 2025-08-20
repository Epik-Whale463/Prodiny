import { useState, useEffect } from 'react'
import { authApi } from '@/lib/api'

export default function APIStatus() {
  const [status, setStatus] = useState<Record<string, any>>({})

  useEffect(() => {
    checkAPIs()
  }, [])

  const checkAPIs = async () => {
    const results: Record<string, any> = {}
    
    try {
      results.posts = await authApi.getPosts()
      results.postsCount = results.posts?.length || 0
    } catch (e) {
      results.postsError = e
    }

    try {
      results.subgroups = await authApi.getSubgroups()
      results.subgroupsCount = results.subgroups?.length || 0
    } catch (e) {
      results.subgroupsError = e
    }

    try {
      results.projects = await authApi.getProjects()
      results.projectsCount = results.projects?.length || 0
    } catch (e) {
      results.projectsError = e
    }

    try {
      results.colleges = await authApi.getColleges()
      results.collegesCount = results.colleges?.length || 0
    } catch (e) {
      results.collegesError = e
    }

    setStatus(results)
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">API Status Check</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-100 rounded">
          <h3 className="font-semibold">Posts</h3>
          <p>Count: {status.postsCount}</p>
          {status.postsError && <p className="text-red-600">Error: {String(status.postsError)}</p>}
        </div>
        
        <div className="p-3 bg-blue-100 rounded">
          <h3 className="font-semibold">Subgroups</h3>
          <p>Count: {status.subgroupsCount}</p>
          {status.subgroupsError && <p className="text-red-600">Error: {String(status.subgroupsError)}</p>}
        </div>
        
        <div className="p-3 bg-purple-100 rounded">
          <h3 className="font-semibold">Projects</h3>
          <p>Count: {status.projectsCount}</p>
          {status.projectsError && <p className="text-red-600">Error: {String(status.projectsError)}</p>}
        </div>
        
        <div className="p-3 bg-yellow-100 rounded">
          <h3 className="font-semibold">Colleges</h3>
          <p>Count: {status.collegesCount}</p>
          {status.collegesError && <p className="text-red-600">Error: {String(status.collegesError)}</p>}
        </div>
      </div>
    </div>
  )
}
