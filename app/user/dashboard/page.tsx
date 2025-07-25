"use client"

import {useEffect, useState} from "react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {useAuth} from "@/contexts/auth-context"
import {Clock, Lock, Megaphone, Play, RefreshCw, Square, Unlock, User, Zap} from "lucide-react"
import {apiRequestWithAuth, getStoredToken, isTokenValid} from "@/lib/api-config"
import {useToast} from "@/hooks/use-toast"
import {DashboardLayout} from "@/components/dashboard-layout"

export default function UserDashboard() {
  const { token: contextToken } = useAuth()
  const { toast } = useToast()
  const [userStatus, setUserStatus] = useState<any>(null)
  const [userAccount, setUserAccount] = useState<any>(null)
  const [sanity, setSanity] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [announcement, setAnnouncement] = useState<any>(null)

  const getToken = () => {
    return contextToken || getStoredToken()
  }

  useEffect(() => {
    const token = getToken()
    if (token && isTokenValid(token)) {
      fetchUserData()
    } else {
      toast({
        variant: "destructive",
        title: "认证失败",
        description: "请重新登录",
      })
    }
    fetchAnnouncement()
  }, [contextToken])

  const fetchAnnouncement = async () => {
    try {
      const result = await apiRequestWithAuth("/getAnnouncement", "", { method: "GET" })
      if (result.code === 200) {
        setAnnouncement(result.data)
      }
    } catch (error) {
    }
  }

  const fetchUserData = async () => {
    const token = getToken()
    if (!token || !isTokenValid(token)) {
      toast({
        variant: "destructive",
        title: "认证失败",
        description: "请重新登录",
      })
      return
    }

    try {
      const statusResult = await apiRequestWithAuth("/showMyStatus", token, {
        method: "GET",
      })
      if (statusResult.code === 200) {
        setUserStatus(statusResult.data)
      } else {
        toast({
          variant: "destructive",
          title: "获取状态失败",
          description: statusResult.msg || "无法获取用户状态",
        })
      }

      const accountResult = await apiRequestWithAuth("/showMyAccount", token, {
        method: "GET",
      })
      if (accountResult.code === 200) {
        setUserAccount(accountResult.data)
      } else {
        toast({
          variant: "destructive",
          title: "获取账号信息失败",
          description: accountResult.msg || "无法获取账号信息",
        })
      }


      const sanityResult = await apiRequestWithAuth("/showMySan", token, {
        method: "GET",
      })
      if (sanityResult.code === 200) {
        setSanity(String(sanityResult.data))
      } else {
        toast({
          variant: "destructive",
          title: "获取理智状态失败",
          description: sanityResult.msg || "无法获取理智状态",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "网络错误",
        description: error instanceof Error ? error.message : "无法连接到服务器",
      })
    }
  }

  const handleStartNow = async () => {
    const token = getToken()
    if (!token || !isTokenValid(token)) return

    setLoading(true)
    try {
      const result = await apiRequestWithAuth("/startNow", token, {
        method: "POST",
      })
      if (result.code === 200) {
        toast({
          variant: "success",
          title: "操作成功",
          description: "已成功开始作战",
        })
        await fetchUserData()
      } else {
        toast({
          variant: "destructive",
          title: "操作失败",
          description: result.msg || "无法开始作战",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "网络错误",
        description: error instanceof Error ? error.message : "操作失败",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForceHalt = async () => {
    const token = getToken()
    if (!token || !isTokenValid(token)) return

    setLoading(true)
    try {
      const result = await apiRequestWithAuth("/forceHalt", token, {
        method: "POST",
      })
      if (result.code === 200) {
        toast({
          variant: "success",
          title: "操作成功",
          description: "已成功停止作战",
        })
        await fetchUserData()
      } else {
        toast({
          variant: "destructive",
          title: "操作失败",
          description: result.msg || "无法停止作战",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "网络错误",
        description: error instanceof Error ? error.message : "操作失败",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFreezeToggle = async () => {
    const token = getToken()
    if (!token || !isTokenValid(token) || !userAccount) return
    setLoading(true)
    try {
      let api = userAccount.freeze ? "/unfreezeMyAccount" : "/freezeMyAccount"
      const result = await apiRequestWithAuth(api, token, { method: "POST" })
      if (result.code === 200) {
        toast({
          variant: "success",
          title: userAccount.freeze ? "解冻成功" : "冻结成功",
          description: userAccount.freeze ? "账户已解冻" : "账户已冻结",
        })
        await fetchUserData()
      } else {
        toast({
          variant: "destructive",
          title: "操作失败",
          description: result.msg || (userAccount.freeze ? "解冻失败" : "冻结失败"),
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "网络错误",
        description: error instanceof Error ? error.message : "操作失败",
      })
    } finally {
      setLoading(false)
    }
  }

  const token = getToken()
  if (!token || !isTokenValid(token)) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 dark:text-gray-400 mb-4">请先登录</div>
          <Button onClick={() => (window.location.href = "/")}>返回登录</Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">用户仪表板</h1>
        <p className="text-gray-600 dark:text-gray-400">欢迎回来，管理您的账号和任务</p>
        {announcement && (
          <Card className="mt-4 border-blue-400 dark:border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white flex items-center">
                <Megaphone className="h-4 w-4 mr-2 text-blue-500" />
                {announcement.title || "公告"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base dark:text-white whitespace-pre-line">{announcement.context}</div>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">账号状态</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{userStatus?.status ?? "加载中..."}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">当前理智</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{sanity || "加载中..."}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">剩余刷新</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{userAccount?.refresh ?? "加载中..."}</div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">到期时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">
              {userAccount?.expireTime ? new Date(userAccount.expireTime).toLocaleDateString() : "加载中..."}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">快速操作</CardTitle>
            <CardDescription className="dark:text-gray-400">管理您的作战任务</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleStartNow} disabled={loading} className="w-full">
              <Play className="mr-2 h-4 w-4" />
              立即开始作战
            </Button>
            <Button onClick={handleForceHalt} disabled={loading} variant="destructive" className="w-full">
              <Square className="mr-2 h-4 w-4" />
              强制停止作战
            </Button>
            <Button onClick={handleFreezeToggle} disabled={loading || !userAccount} variant={userAccount?.freeze ? "default" : "outline"} className="w-full">
              {userAccount?.freeze ? <Unlock className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
              {userAccount?.freeze ? "解冻账户" : "冻结账户"}
            </Button>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">账号信息</CardTitle>
            <CardDescription className="dark:text-gray-400">您的账号详细信息</CardDescription>
          </CardHeader>
          <CardContent>
            {userAccount ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">账号名称:</span>
                  <span className="text-sm font-medium dark:text-white">{userAccount.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">游戏账号:</span>
                  <span className="text-sm font-medium dark:text-white">{userAccount.account}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">服务器:</span>
                  <span className="text-sm font-medium dark:text-white">
                    {userAccount.server === 0 ? "官服" : "B服"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">任务类型:</span>
                  <span className="text-sm font-medium dark:text-white">{userAccount.taskType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">冻结状态:</span>
                  <span className="text-sm font-medium dark:text-white">{userAccount.freeze ? "已冻结" : "正常"}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">加载中...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
