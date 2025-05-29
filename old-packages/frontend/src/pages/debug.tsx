import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

import debugLogger, { LogLevel } from '@/utils/debugLogger';
import Head from 'next/head';

import React, { useEffect, useState } from 'react';

// Define the log entry type
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: unknown;
}

// Define the auth debug info type
interface AuthDebugInfo {
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  hasUser: boolean;
  userId?: string;
  username?: string;
  email?: string;
}

// Define the cookie debug info type
interface CookieDebugInfo {
  name: string;
  value: string;
  expires?: string;
}

const DebugPage: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logLevel, setLogLevel] = useState<LogLevel>(LogLevel.INFO);
  const [storageLogging, setStorageLogging] = useState<boolean>(true);
  const [authDebugInfo, setAuthDebugInfo] = useState<AuthDebugInfo | null>(
    null,
  );
  const [cookieDebugInfo, setCookieDebugInfo] = useState<CookieDebugInfo[]>([]);
  const [localStorageDebugInfo, setLocalStorageDebugInfo] = useState<
    CookieDebugInfo[]
  >([]);
  const [activeTab, setActiveTab] = useState<string>('logs');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<LogLevel | null>(null);
  const { user, isAuthenticated, isInitialized, isLoading, checkUser } =
    useAuth();
  const router = useRouter();

  // Load logs on mount
  useEffect(() => {
    // Load logs
    const loadLogs = async () => {
      const loadedLogs = await debugLogger.getLogs();
      setLogs(loadedLogs);
    };

    loadLogs();

    // Get current log level
    setLogLevel(debugLogger.getLogLevel());

    // Set up interval to refresh logs
    const intervalId = setInterval(async () => {
      const refreshedLogs = await debugLogger.getLogs();
      setLogs(refreshedLogs);
    }, 2000);

    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // Load auth debug info
  useEffect(() => {
    setAuthDebugInfo({
      isAuthenticated,
      isInitialized,
      isLoading,
      hasUser: !!user,
      userId: user?.id,
      username: user?.username,
      email: user?.email,
    });
  }, [isAuthenticated, isInitialized, isLoading, user]);

  // Load cookie debug info
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // Parse cookies (only non-HttpOnly cookies will be visible)
    const cookies = document.cookie.split(';').map((cookie) => {
      const [name, value] = cookie.trim().split('=');
      return { name, value };
    });

    setCookieDebugInfo(cookies);

    // We no longer use localStorage for authentication
    setLocalStorageDebugInfo([]);
  }, []);

  // Handle log level change
  const handleLogLevelChange = (value: string): void => {
    const level = LogLevel[value as keyof typeof LogLevel];
    setLogLevel(level);
    debugLogger.setLogLevel(level);
  };

  // Handle storage logging change
  const handleStorageLoggingChange = (checked: boolean): void => {
    setStorageLogging(checked);
    debugLogger.enableStorageLogging(checked);
  };

  // Handle clear logs
  const handleClearLogs = async () => {
    await debugLogger.clearLogs();
    setLogs([]);
  };

  // Handle export logs
  const handleExportLogs = async () => {
    await debugLogger.exportLogs();
  };

  // Handle refresh auth
  const handleRefreshAuth = (): void => {
    checkUser();
  };

  // Filter logs by category and level
  const filteredLogs = logs.filter((log) => {
    if (
      filterCategory &&
      !log.category.toLowerCase().includes(filterCategory.toLowerCase())
    ) {
      return false;
    }
    if (filterLevel !== null && log.level !== filterLevel) {
      return false;
    }
    return true;
  });

  // Get log level color
  const getLogLevelColor = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.ERROR:
        return 'text-red-500';
      case LogLevel.WARN:
        return 'text-yellow-500';
      case LogLevel.INFO:
        return 'text-blue-500';
      case LogLevel.DEBUG:
        return 'text-green-500';
      case LogLevel.TRACE:
        return 'text-gray-500';
      default:
        return '';
    }
  };

  // Format data for display
  const formatData = (data: unknown): string => {
    if (!data) return '';
    try {
      return JSON.stringify(data, null, 2);
    } catch (_) {
      return String(data);
    }
  };

  return (
    <>
      <Head>
        <title>Debug | BellyFed</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Debug Console</h1>
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="storage">Storage</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Logs Tab */}
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Debug Logs</CardTitle>
                <CardDescription>
                  View and filter application logs
                </CardDescription>
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Filter by category"
                      className="px-3 py-2 border rounded-md"
                      value={filterCategory}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFilterCategory(e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={filterLevel !== null ? LogLevel[filterLevel] : ''}
                      onValueChange={(value: string) => {
                        if (value === '') {
                          setFilterLevel(null);
                        } else {
                          setFilterLevel(
                            LogLevel[value as keyof typeof LogLevel],
                          );
                        }
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Levels</SelectItem>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="WARN">Warning</SelectItem>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="DEBUG">Debug</SelectItem>
                        <SelectItem value="TRACE">Trace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 ml-auto">
                    <Button variant="outline" onClick={handleClearLogs}>
                      Clear Logs
                    </Button>
                    <Button onClick={handleExportLogs}>Export Logs</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead className="w-[100px]">Level</TableHead>
                        <TableHead className="w-[150px]">Category</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No logs found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredLogs.map((log, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </TableCell>
                            <TableCell className={getLogLevelColor(log.level)}>
                              {LogLevel[log.level]}
                            </TableCell>
                            <TableCell>{log.category}</TableCell>
                            <TableCell>{log.message}</TableCell>
                            <TableCell>
                              {log.data ? (
                                <pre className="text-xs overflow-auto max-w-[300px] max-h-[100px]">
                                  {formatData(log.data)}
                                </pre>
                              ) : null}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="auth">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Debug</CardTitle>
                <CardDescription>
                  View authentication state and user information
                </CardDescription>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleRefreshAuth}>
                    Refresh Auth State
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Auth State</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Is Authenticated:</span>
                        <span
                          className={
                            authDebugInfo?.isAuthenticated
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {authDebugInfo?.isAuthenticated ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Is Initialized:</span>
                        <span
                          className={
                            authDebugInfo?.isInitialized
                              ? 'text-green-500'
                              : 'text-yellow-500'
                          }
                        >
                          {authDebugInfo?.isInitialized ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Is Loading:</span>
                        <span
                          className={
                            authDebugInfo?.isLoading
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }
                        >
                          {authDebugInfo?.isLoading ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Has User:</span>
                        <span
                          className={
                            authDebugInfo?.hasUser
                              ? 'text-green-500'
                              : 'text-red-500'
                          }
                        >
                          {authDebugInfo?.hasUser ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      User Information
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>User ID:</span>
                        <span className="font-mono">
                          {authDebugInfo?.userId || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Username:</span>
                        <span>{authDebugInfo?.username || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span>{authDebugInfo?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Storage Tab */}
          <TabsContent value="storage">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cookies</CardTitle>
                  <CardDescription>View browser cookies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-auto max-h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cookieDebugInfo.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-4">
                              No cookies found
                            </TableCell>
                          </TableRow>
                        ) : (
                          cookieDebugInfo.map((cookie, index) => (
                            <TableRow key={index}>
                              <TableCell>{cookie.name}</TableCell>
                              <TableCell>
                                <div className="font-mono text-xs overflow-auto max-w-[300px] max-h-[100px]">
                                  {cookie.value}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Local Storage</CardTitle>
                  <CardDescription>View browser local storage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md overflow-auto max-h-[300px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Key</TableHead>
                          <TableHead>Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {localStorageDebugInfo.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-4">
                              No local storage items found
                            </TableCell>
                          </TableRow>
                        ) : (
                          localStorageDebugInfo.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.name}</TableCell>
                              <TableCell>
                                <pre className="font-mono text-xs overflow-auto max-w-[300px] max-h-[100px]">
                                  {item.value.length > 100
                                    ? `${item.value.substring(0, 100)}...`
                                    : item.value}
                                </pre>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Debug Settings</CardTitle>
                <CardDescription>
                  Configure debug logging settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col space-y-2">
                    <label className="font-medium">Log Level</label>
                    <Select
                      value={LogLevel[logLevel]}
                      onValueChange={handleLogLevelChange}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select log level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ERROR">Error</SelectItem>
                        <SelectItem value="WARN">Warning</SelectItem>
                        <SelectItem value="INFO">Info</SelectItem>
                        <SelectItem value="DEBUG">Debug</SelectItem>
                        <SelectItem value="TRACE">Trace</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">
                      Set the minimum log level to display and store
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium">Storage Logging</label>
                      <p className="text-sm text-gray-500">
                        Enable or disable logging to localStorage
                      </p>
                    </div>
                    <Switch
                      checked={storageLogging}
                      onCheckedChange={handleStorageLoggingChange}
                    />
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">
                      Debug URL Parameters
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      Add these parameters to any URL to control debug logging:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        <code>?debug=trace</code> - Set log level to TRACE
                      </li>
                      <li>
                        <code>?debug=debug</code> - Set log level to DEBUG
                      </li>
                      <li>
                        <code>?debug=info</code> - Set log level to INFO
                      </li>
                      <li>
                        <code>?debug=warn</code> - Set log level to WARN
                      </li>
                      <li>
                        <code>?debug=error</code> - Set log level to ERROR
                      </li>
                      <li>
                        <code>?debug=none</code> - Disable all logging
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default DebugPage;
