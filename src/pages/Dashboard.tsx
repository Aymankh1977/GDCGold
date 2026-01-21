import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  BarChart3,
  CheckCircle,
  Clock,
  ArrowRight,
  Upload,
  Play,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { useDocumentStore } from "@/store/documentStore";
import { useAnalysisStore } from "@/store/analysisStore";
import { GDC_STANDARDS } from "@/config/gdcStandards";
import type { Document } from "@/types";

const Dashboard: React.FC = () => {
  const { documents } = useDocumentStore();
  const { analyses, reports } = useAnalysisStore();

  // Hard guard against any corrupted persisted entries
  const safeDocuments: Document[] = useMemo(
    () => (Array.isArray(documents) ? documents.filter(Boolean) : []),
    [documents]
  );

  const stats = [
    {
      name: "Documents",
      value: safeDocuments.length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "Local library",
    },
    {
      name: "Analyses",
      value: analyses.length,
      icon: BarChart3,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "Stored results",
    },
    {
      name: "Reports",
      value: reports.length,
      icon: CheckCircle,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      trend: "Ready to review",
    },
    {
      name: "Compliance",
      value: "—",
      icon: ShieldCheck,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      trend: "Run analysis",
    },
  ];

  // Keep this deterministic (no Math.random in UI)
  const standardProgress = (standardId: number) => {
    // If you later compute compliance, plug it here.
    // For now: stable placeholder based on ID.
    const base = 60 + (standardId % 7) * 5;
    return Math.min(90, base);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h1>
            <p className="text-gray-500 mt-2 max-w-md">
              Upload evidence, run an analysis, and track progress across standards.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/documents">
              <Button variant="outline" className="rounded-xl px-6" icon={<Upload className="w-4 h-4" />}>
                Upload
              </Button>
            </Link>
            <Link to="/analysis">
              <Button className="rounded-xl px-6 shadow-lg shadow-primary-200" icon={<Play className="w-4 h-4" />}>
                Start Analysis
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            className="group border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white p-6 rounded-3xl"
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className={"p-3 rounded-2xl " + stat.bgColor + " transition-transform group-hover:scale-110 duration-300"}>
                  <stat.icon className={"w-6 h-6 " + stat.color} />
                </div>
                <TrendingUp className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">{stat.name}</p>
              </div>
              <div className="pt-2 border-t border-gray-50">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{stat.trend}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Standards */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader
            title="Accreditation Standards"
            subtitle="Track coverage across requirements"
            action={
              <Link to="/analysis">
                <Button variant="ghost" size="sm" className="text-primary-600 font-bold hover:bg-primary-50 rounded-lg">
                  Full Report <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
          />
          <div className="p-6 pt-0 space-y-6">
            {GDC_STANDARDS.map((standard) => (
              <div
                key={standard.id}
                className="group p-5 bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-sm font-bold text-primary-600">
                      {standard.id}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{standard.name}</h4>
                      <p className="text-xs text-gray-500">{standard.requirements.length} Requirements</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{standardProgress(standard.id)}%</span>
                  </div>
                </div>

                <ProgressBar
                  progress={standardProgress(standard.id)}
                  size="sm"
                  className="h-2 rounded-full bg-gray-200"
                  color="primary"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="border-none shadow-lg shadow-primary-50 bg-primary-600 rounded-3xl p-6 text-white">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { label: "Upload Evidence", icon: Upload, path: "/documents" },
                { label: "Run AI Audit", icon: BarChart3, path: "/analysis" },
                { label: "Compliance Form", icon: Clock, path: "/questionnaire" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="flex items-center justify-between p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <action.icon className="w-5 h-5 text-white/80" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader title="Recent Activity" />
            <div className="p-6 pt-0">
              {safeDocuments.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {safeDocuments.slice(0, 4).map((doc) => (
                    <div key={doc.id} className="flex items-start gap-3 group">
                      <div className="mt-1 w-2 h-2 rounded-full bg-primary-500 ring-4 ring-primary-50"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                          {doc.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {doc.category} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Link to="/documents">
                <Button variant="ghost" className="w-full mt-6 text-xs font-bold text-gray-400 hover:text-primary-600">
                  VIEW ALL DOCUMENTS
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
