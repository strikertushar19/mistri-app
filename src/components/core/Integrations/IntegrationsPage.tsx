"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Image from "next/image";

interface IntegrationCard {
  id: string;
  name: string;
  description: string;
  icon: string | { src: string; alt: string };
  status: "connected" | "disconnected" | "connecting";
  category: "codebase" | "infrastructure";
}

interface IntegrationsPageProps {
  selectedProject: any;
}

export function IntegrationsPage({ selectedProject }: IntegrationsPageProps) {
  const [integrations, setIntegrations] = useState<IntegrationCard[]>([
    // Codebase Integrations
    {
      id: "github",
      name: "GitHub",
      description: "Connect your GitHub repositories for code analysis and insights",
      icon: { src: "/github-mark.svg", alt: "GitHub" },
      status: "disconnected",
      category: "codebase"
    },
    {
      id: "gitlab",
      name: "GitLab",
      description: "Integrate with GitLab for comprehensive code review and analysis",
      icon: { src: "/gitlab-svgrepo-com.svg", alt: "GitLab" },
      status: "disconnected",
      category: "codebase"
    },
    {
      id: "bitbucket",
      name: "Bitbucket",
      description: "Connect Bitbucket repositories for seamless code analysis",
      icon: { src: "/bitbucket.svg", alt: "Bitbucket" },
      status: "disconnected",
      category: "codebase"
    },
    // Infrastructure Integrations
    {
      id: "aws",
      name: "AWS",
      description: "Connect AWS services for infrastructure analysis and monitoring",
      icon: "☁️",
      status: "disconnected",
      category: "infrastructure"
    },
    {
      id: "azure",
      name: "Azure",
      description: "Integrate with Microsoft Azure for cloud infrastructure insights",
      icon: "🔷",
      status: "disconnected",
      category: "infrastructure"
    },
    {
      id: "gcp",
      name: "Google Cloud Platform",
      description: "Connect GCP services for comprehensive cloud analysis",
      icon: "🌐",
      status: "disconnected",
      category: "infrastructure"
    }
  ]);

  const handleConnect = async (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: "connecting" as const }
          : integration
      )
    );

    // Simulate connection process
    setTimeout(() => {
      setIntegrations(prev => 
        prev.map(integration => 
          integration.id === integrationId 
            ? { ...integration, status: "connected" as const }
            : integration
        )
      );
    }, 2000);
  };

  const handleDisconnect = async (integrationId: string) => {
    setIntegrations(prev => 
      prev.map(integration => 
        integration.id === integrationId 
          ? { ...integration, status: "disconnected" as const }
          : integration
      )
    );
  };

  const codebaseIntegrations = integrations.filter(i => i.category === "codebase");
  const infrastructureIntegrations = integrations.filter(i => i.category === "infrastructure");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400";
      case "connecting":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "connecting":
        return "Connecting...";
      default:
        return "Not Connected";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Integrations
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Connect your codebase and infrastructure services to get comprehensive insights.
        </p>
      </div>

      {/* Codebase Integrations */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Codebase Integrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {codebaseIntegrations.map((integration) => (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">
                  {typeof integration.icon === 'string' ? (
                    integration.icon
                  ) : (
                    <Image
                      src={integration.icon.src}
                      alt={integration.icon.alt}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                  {getStatusText(integration.status)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {integration.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {integration.description}
              </p>
              <div className="flex gap-2">
                {integration.status === "connected" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(integration.id)}
                    className="flex-1"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(integration.id)}
                    disabled={integration.status === "connecting"}
                    className="flex-1"
                  >
                    {integration.status === "connecting" ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Infrastructure Integrations */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Infrastructure Integrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {infrastructureIntegrations.map((integration) => (
            <Card key={integration.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">
                  {typeof integration.icon === 'string' ? (
                    integration.icon
                  ) : (
                    <Image
                      src={integration.icon.src}
                      alt={integration.icon.alt}
                      width={32}
                      height={32}
                      className="w-8 h-8"
                    />
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(integration.status)}`}>
                  {getStatusText(integration.status)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {integration.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {integration.description}
              </p>
              <div className="flex gap-2">
                {integration.status === "connected" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(integration.id)}
                    className="flex-1"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(integration.id)}
                    disabled={integration.status === "connecting"}
                    className="flex-1"
                  >
                    {integration.status === "connecting" ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 