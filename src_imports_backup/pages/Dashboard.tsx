import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ArrowRight,
  Upload,
  Play
} from 'lucide-react';
import { Card, CardHeader } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useDocumentStore } from '@/store/documentStore';
import { useAnalysisStore } from '@/store/analysisStore';
import { GDC_STANDARDS } from '@/config/gdcStandards';

const Dashboard: React.FC = () => {
  const { documents } = useDocumentStore();
  const { analyses, reports } = useAnalysisStore();

  const stats = [
    {
      name: 'Documents Uploaded',
      value: documents.length,
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Analyses Completed',
      value: analyses.length,
      icon: BarChart3,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Reports Generated',
      value: reports.length,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Requirements Tracked',
      value: 21,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome to DetEdTech - Your GDC Accreditation AI Platform
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/documents">
            <Button variant="outline" icon={<Upload className="w-4 h-4" />}>
              Upload Document
            </Button>
          </Link>
          <Link to="/analysis">
            <Button icon={<Play className="w-4 h-4" />}>
              Start Analysis
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} hover>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.name}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GDC Standards Overview */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="GDC Standards Overview"
            subtitle="21 Requirements across 3 Standards"
            action={
              <Link to="/analysis">
                <Button variant="ghost" size="sm">
                  View Details <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            }
          />
          <div className="space-y-4">
            {GDC_STANDARDS.map((standard) => (
              <div key={standard.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    Standard {standard.id}: {standard.name}
                  </h4>
                  <span className="text-sm text-gray-500">
                    {standard.requirements.length} requirements
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {standard.description.slice(0, 150)}...
                </p>
                <ProgressBar
                  progress={Math.random() * 100}
                  size="sm"
                  color="primary"
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <div className="space-y-3">
            <Link to="/documents" className="block">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Upload className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Upload Documents</p>
                    <p className="text-sm text-gray-500">PDF or Word files</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/analysis" className="block">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Run Analysis</p>
                    <p className="text-sm text-gray-500">Evaluate against GDC standards</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link to="/questionnaire" className="block">
              <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">Pre-Inspection Form</p>
                    <p className="text-sm text-gray-500">Review questionnaire</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader
          title="Recent Activity"
          action={
            <Button variant="ghost" size="sm">
              View All
            </Button>
          }
        />
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents uploaded yet</p>
            <Link to="/documents">
              <Button variant="secondary" size="sm" className="mt-3">
                Upload your first document
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.slice(0, 5).map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{doc.name}</p>
                    <p className="text-sm text-gray-500">{doc.category}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full
                  ${doc.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'}`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;