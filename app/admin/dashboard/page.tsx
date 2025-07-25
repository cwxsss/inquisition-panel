"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, DollarSign, TrendingUp, UserCheck, Lock } from "lucide-react"
import { apiRequestWithAuth, getStoredToken, isTokenValid } from "@/lib/api-config"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { DashboardLayout } from "@/components/dashboard-layout"

export default function AdminDashboard() {
  const { token: contextToken } = useAuth()
  const { toast } = useToast()
  const [statistics, setStatistics] = useState<any>(null)
  const [passwordForm, setPasswordForm] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
  })
  const [loading, setLoading] = useState(false)

  const getToken = () => {
    return contextToken || getStoredToken()
  }

  useEffect(() => {
    const token = getToken()
    if (token && isTokenValid(token)) {
      fetchStatistics()
    }
  }, [contextToken])

  const fetchStatistics = async () => {
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
      const result = await apiRequestWithAuth("/getStatistics", token, {
        method: "GET",
      })
      if (result.code === 200) {
        setStatistics(result.data)
      } else {
        toast({
          variant: "destructive",
          title: "获取统计数据失败",
          description: result.msg || "无法获取统计数据",
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = getToken()
    if (!token || !isTokenValid(token)) {
      toast({
        variant: "destructive",
        title: "未授权",
        description: "请先登录",
      })
      return
    }

    setLoading(true)
    try {
      const result = await apiRequestWithAuth("/changeAdminPassword", token, {
        method: "POST",
        body: JSON.stringify(passwordForm),
      })
      if (result.code === 200) {
        toast({
          variant: "success",
          title: "密码修改成功",
          description: "管理员密码已成功更新",
        })
        setPasswordForm({ username: "", oldPassword: "", newPassword: "" })
      } else {
        toast({
          variant: "destructive",
          title: "密码修改失败",
          description: result.msg || "请检查输入信息",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "密码修改失败",
        description: error instanceof Error ? error.message : "网络连接错误",
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">管理员总览</h1>
        <p className="text-gray-600 dark:text-gray-400">系统概览和统计数据</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">新用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{statistics?.newUserNum ?? "加载中..."}</div>
            <p className="text-xs text-muted-foreground">本期新增用户</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">月收入</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">¥{statistics?.monthIncome?.toFixed(2) ?? "0.00"}</div>
            <p className="text-xs text-muted-foreground">本月总收入</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">日收入</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">¥{statistics?.dayIncome?.toFixed(2) ?? "0.00"}</div>
            <p className="text-xs text-muted-foreground">今日收入</p>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium dark:text-white">付费用户</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{statistics?.payedUserNum ?? "加载中..."}</div>
            <p className="text-xs text-muted-foreground">总付费用户数</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Lock className="h-5 w-5" />
              修改管理员密码
            </CardTitle>
            <CardDescription className="dark:text-gray-400">更新管理员账户密码</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="dark:text-white">
                  用户名
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={passwordForm.username}
                  onChange={(e) => setPasswordForm({ ...passwordForm, username: e.target.value })}
                  placeholder="请输入管理员用户名"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oldPassword" className="dark:text-white">
                  当前密码
                </Label>
                <Input
                  id="oldPassword"
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  placeholder="请输入当前密码"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="dark:text-white">
                  新密码
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="请输入新密码"
                  required
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "修改中..." : "修改密码"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">系统状态</CardTitle>
            <CardDescription className="dark:text-gray-400">当前系统运行状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium dark:text-white">系统负载</span>
                <span className="text-sm text-green-600">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium dark:text-white">数据库状态</span>
                <span className="text-sm text-green-600">连接正常</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium dark:text-white">API响应时间</span>
                <span className="text-sm text-green-600">{"< 100ms"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium dark:text-white">在线用户</span>
                <span className="text-sm text-blue-600">{statistics?.payedUserNum ?? 0} 人</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
