"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { apiRequestWithAuth, getStoredToken, isTokenValid } from "@/lib/api-config"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Badge } from "@/components/ui/badge"
import { Calendar, List } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface LogItem {
  id: number
  level: string
  taskType: string
  title: string
  detail: string
  imageUrl?: string
  from?: string | null
  server?: number
  name: string
  account: string
  password?: string
  time: string
  delete?: number
}

export default function UserLogs() {
  const { token: contextToken } = useAuth()
  const { toast } = useToast()
  const [logs, setLogs] = useState<LogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [previewImg, setPreviewImg] = useState<string | null>(null)

  const getToken = () => contextToken || getStoredToken()

  const fetchLogs = async (pageNum = 1) => {
    const token = getToken()
    if (!token || !isTokenValid(token)) {
      toast({ variant: "destructive", title: "认证失败", description: "请重新登录" })
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const url = `/showMyLog?current=${pageNum}&size=${pageSize}`
      const result = await apiRequestWithAuth(url, token, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
      if (result.code === 200) {
        const data = result.data as { records: LogItem[]; total: number; current: number }
        setLogs(data.records || [])
        setTotal(data.total || 0)
      } else {
        toast({ variant: "destructive", title: "获取失败", description: result.msg })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "网络错误", description: error instanceof Error ? error.message : "获取失败" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs(page)
  }, [page])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN")
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">操作日志</h1>
          <p className="text-gray-600 dark:text-gray-400">查看您的账户操作日志</p>
        </div>
        <Button onClick={() => fetchLogs(page)} disabled={loading} className="h-10 px-6">
          {loading ? "加载中..." : "刷新日志"}
        </Button>
      </div>
      <Card className="dark:bg-gray-800 dark:border-gray-700 w-full h-full min-h-[60vh] p-4 md:p-8">
        <CardHeader>
          <CardTitle className="dark:text-white flex items-center gap-2">
            <List className="h-5 w-5" /> 日志列表
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div>加载中...</div>
          ) : logs.length === 0 ? (
            <div>暂无日志</div>
          ) : (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="p-4 border rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={log.level === 'WARN' ? 'destructive' : 'default'}>{log.level}</Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">用户: {log.name} 任务类型: {log.taskType}</span>
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-100 mb-1 font-semibold">{log.title}</div>
                  <div className="text-sm text-gray-800 dark:text-gray-100 mb-1">{log.detail}</div>
                  {log.imageUrl && (
                    <div className="my-2">
                      <img
                        src={log.imageUrl}
                        alt="日志图片"
                        className="max-h-40 rounded border cursor-pointer"
                        onClick={() => setPreviewImg(log.imageUrl!)}
                      />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {formatDate(log.time)}
                  </div>
                </div>
              ))}
            </div>
          )}
          <Dialog open={!!previewImg} onOpenChange={open => !open && setPreviewImg(null)}>
            <DialogContent className="flex flex-col items-center justify-center max-w-2xl">
              {previewImg && (
                <img src={previewImg} alt="大图预览" className="max-h-[70vh] max-w-full rounded shadow-lg" />
              )}
            </DialogContent>
          </Dialog>
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading}>上一页</Button>
              <span className="text-sm text-gray-700 dark:text-gray-300">第 {page} / {totalPages} 页</span>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}>下一页</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
} 