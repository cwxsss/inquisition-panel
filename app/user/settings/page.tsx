"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiRequestWithAuth, getStoredToken, isTokenValid } from "@/lib/api-config"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function UserSettings() {
  const { token: contextToken } = useAuth()
  const { toast } = useToast()
  const [cdk, setCdk] = useState("")
  const [cdkLoading, setCdkLoading] = useState(false)
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [server, setServer] = useState("0")
  const [updateLoading, setUpdateLoading] = useState(false)

  const getToken = () => contextToken || getStoredToken()

  const handleCdkActivate = async () => {
    const token = getToken()
    if (!token || !isTokenValid(token)) {
      toast({ variant: "destructive", title: "认证失败", description: "请重新登录" })
      return
    }
    if (!cdk) {
      toast({ variant: "destructive", title: "请输入CDK" })
      return
    }
    setCdkLoading(true)
    try {
      const result = await apiRequestWithAuth("/useCDK", token, {
        method: "POST",
        body: JSON.stringify({ cdk }),
        headers: { "Content-Type": "application/json" },
      })
      if (result.code === 200) {
        toast({ variant: "success", title: "激活成功", description: result.msg })
        setCdk("")
      } else {
        toast({ variant: "destructive", title: "激活失败", description: result.msg })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "网络错误", description: error instanceof Error ? error.message : "激活失败" })
    } finally {
      setCdkLoading(false)
    }
  }

  const handleUpdateAccount = async () => {
    const token = getToken()
    if (!token || !isTokenValid(token)) {
      toast({ variant: "destructive", title: "认证失败", description: "请重新登录" })
      return
    }
    if (!account || !password) {
      toast({ variant: "destructive", title: "请填写完整信息" })
      return
    }
    setUpdateLoading(true)
    try {
      const result = await apiRequestWithAuth("/updateAccountAndPassword", token, {
        method: "POST",
        body: JSON.stringify({ account, password, server: Number(server) }),
        headers: { "Content-Type": "application/json" },
      })
      if (result.code === 200) {
        toast({ variant: "success", title: "修改成功", description: result.msg })
        setAccount("")
        setPassword("")
        setServer("0")
      } else {
        toast({ variant: "destructive", title: "修改失败", description: result.msg })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "网络错误", description: error instanceof Error ? error.message : "修改失败" })
    } finally {
      setUpdateLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">其他设置</h1>
        <p className="text-gray-600 dark:text-gray-400">管理您的CDK激活和账户信息</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">CDK激活</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="请输入CDK"
              value={cdk}
              onChange={e => setCdk(e.target.value)}
              disabled={cdkLoading}
            />
            <Button onClick={handleCdkActivate} disabled={cdkLoading} className="w-full">
              {cdkLoading ? "激活中..." : "激活"}
            </Button>
          </CardContent>
        </Card>
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">修改账户密码和服务器类型</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="新账号"
              value={account}
              onChange={e => setAccount(e.target.value)}
              disabled={updateLoading}
            />
            <Input
              placeholder="新密码"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={updateLoading}
            />
            <Select value={server} onValueChange={setServer} disabled={updateLoading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择服务器" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">官服</SelectItem>
                <SelectItem value="1">B服</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleUpdateAccount} disabled={updateLoading} className="w-full">
              {updateLoading ? "修改中..." : "修改"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
} 