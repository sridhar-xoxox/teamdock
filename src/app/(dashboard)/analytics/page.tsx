"use client";
import { BarChart3, TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

function MetricCard({ title, value, sub, icon: Icon, color }: any) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg shadow-inner", color)}>
          <Icon className="h-4 w-4 text-white" />
        </span>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">{value}</p>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{sub}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { tasks } = useStore();

  const total = tasks.length;
  const done = tasks.filter((t) => t.isCompleted).length;
  const high = tasks.filter((t) => t.priority === "HIGH").length;
  const overdue = tasks.filter((t) => t.dueDate && !t.isCompleted && new Date(t.dueDate) < new Date()).length;
  
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  // Simple mock chart heights
  const chartData = [40, 65, 35, 80, 55, 90, 70];

  return (
    <div className="flex h-full flex-col p-4 sm:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">
          <BarChart3 className="h-4 w-4" />
          <span>Workspace</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Analytics Overview</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">Track your team's velocity and task distribution.</p>
      </header>

      {/* Metrics */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard title="Completion Rate" value={`${completionRate}%`} sub="+5.2% from last week" icon={TrendingUp} color="bg-indigo-500" />
        <MetricCard title="Total Completed" value={done} sub="Across all projects" icon={CheckCircle} color="bg-emerald-500" />
        <MetricCard title="High Priority" value={high} sub={`${tasks.filter(t => t.priority==="HIGH" && t.isCompleted).length} resolved`} icon={AlertTriangle} color="bg-red-500" />
        <MetricCard title="Overdue Tasks" value={overdue} sub="Needs attention" icon={Clock} color="bg-amber-500" />
      </div>

      {/* Charts area */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-6">Tasks Completed (Last 7 Days)</h3>
          <div className="flex h-48 items-end gap-2 sm:gap-4 px-2">
            {chartData.map((val, i) => (
              <div key={i} className="group relative flex flex-1 flex-col justify-end">
                <div 
                  className="w-full rounded-t-lg bg-indigo-500/40 dark:bg-indigo-500/50 hover:bg-indigo-600 dark:hover:bg-indigo-400 transition-all cursor-pointer shadow-sm"
                  style={{ height: `${val}%` }}
                />
                <span className="mt-3 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-200 mb-6">Task Distribution</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-slate-500 dark:text-slate-400">To Do</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">{tasks.filter(t => t.status==="TODO").length}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-slate-400 dark:bg-slate-500 transition-all duration-1000" style={{width:`${total > 0 ? (tasks.filter(t=>t.status==="TODO").length/total)*100 : 0}%`}}/>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-slate-500 dark:text-slate-400">In Progress</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">{tasks.filter(t => t.status==="IN_PROGRESS").length}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-indigo-500 transition-all duration-1000" style={{width:`${total > 0 ? (tasks.filter(t=>t.status==="IN_PROGRESS").length/total)*100 : 0}%`}}/>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-slate-500 dark:text-slate-400">Done</span>
                <span className="text-slate-900 dark:text-slate-200 font-bold">{done}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000" style={{width:`${total > 0 ? (done/total)*100 : 0}%`}}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
