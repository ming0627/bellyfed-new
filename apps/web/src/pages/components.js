/**
 * Component Showcase Page
 *
 * A comprehensive component library and design system showcase that displays
 * all available UI components with interactive examples, theme testing,
 * and documentation.
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import PageLayout from '../components/layout/Layout.js';
import {
  // Basic Components
  Button,
  IconButton,
  Badge,
  CountBadge,
  StatusBadge,
  Avatar,
  Separator,

  // Layout Components
  Card,
  Container,

  // Form Components
  Input,
  Label,
  Switch,
  Textarea,

  // Feedback Components
  Progress,
  Slider,
  Skeleton,
  toast,
  useToast
} from '@bellyfed/ui';
import {
  Sun,
  Moon,
  Monitor,
  Eye,
  Code as CodeIcon,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Search,
  Settings,
  Heart,
  Star,
  User,
  Mail,
  Home,
  Edit,
  Plus,
  X,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  Clock,
  Download,
  Upload,
  Trash,
  Save,
  Share,
  Bell,
  MessageCircle,
  Filter,
  MoreHorizontal,
  MoreVertical,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Loader2,
  Zap,
  Shield,
  Camera,
  Image,
  FileText,
  Folder,
  Link,
  ExternalLink
} from 'lucide-react';

// Component categories for organization
const componentCategories = {
  'Basic Components': {
    description: 'Essential UI building blocks and interactive elements',
    components: ['Button', 'IconButton', 'Badge', 'CountBadge', 'StatusBadge', 'Avatar', 'Separator']
  },
  'Layout Components': {
    description: 'Structure and organization components',
    components: ['Card', 'Container']
  },
  'Form Components': {
    description: 'Input controls and form elements',
    components: ['Input', 'Label', 'Switch', 'Textarea']
  },
  'Feedback Components': {
    description: 'Progress indicators, loading states, and user feedback',
    components: ['Progress', 'Slider', 'Skeleton']
  }
};

export default function ComponentShowcase() {
  const [mounted, setMounted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Basic Components');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState('');
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async (text, componentName) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(componentName);
      toast({
        title: "Code copied!",
        description: `${componentName} code copied to clipboard`,
      });
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  if (!mounted) {
    return (
      <PageLayout title="Component Showcase - Bellyfed Design System">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Component Showcase - Bellyfed Design System"
      description="Interactive showcase of all UI components with theme testing and documentation"
    >
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <Container className="py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold">Component Showcase</h1>
                <p className="text-muted-foreground">Bellyfed Design System - Interactive Component Library</p>
              </div>

              {/* Theme Switcher */}
              <div className="flex items-center gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  title="Light Theme"
                >
                  <Sun className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  title="Dark Theme"
                >
                  <Moon className="h-4 w-4" />
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  title="System Theme"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Introduction */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">How to Use This Showcase</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>• <strong>Browse by Category:</strong> Use the sidebar to filter components by type</p>
                    <p>• <strong>View Props:</strong> Click the <Info className="h-3 w-3 inline mx-1" /> icon to see available properties</p>
                    <p>• <strong>Copy Code:</strong> Click the <Copy className="h-3 w-3 inline mx-1" /> icon to copy usage examples</p>
                    <p>• <strong>Toggle Code:</strong> Click the <CodeIcon className="h-3 w-3 inline mx-1" /> icon to view/hide code examples</p>
                    <p>• <strong>Test Themes:</strong> Switch between light/dark themes to see component behavior</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>

        {/* Main Content */}
        <Container className="py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search">Search Components</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Categories</h3>
                    <Button
                      variant={selectedCategory === 'All' ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory('All')}
                    >
                      All Components
                    </Button>
                    {Object.entries(componentCategories).map(([category, data]) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Component Grid */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {/* Component Count */}
                {(() => {
                  const filteredCategories = Object.entries(componentCategories)
                    .filter(([category]) =>
                      selectedCategory === 'All' || category === selectedCategory
                    );
                  const totalComponents = filteredCategories.reduce((total, [, data]) =>
                    total + data.components.filter(component =>
                      component.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length, 0
                  );

                  return (
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          {selectedCategory === 'All' ? 'All Components' : selectedCategory}
                        </h2>
                        <p className="text-muted-foreground">
                          {totalComponents} component{totalComponents !== 1 ? 's' : ''} found
                          {searchTerm && ` matching "${searchTerm}"`}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {Object.entries(componentCategories)
                  .filter(([category]) =>
                    selectedCategory === 'All' || category === selectedCategory
                  )
                  .map(([category, data]) => {
                    const filteredComponents = data.components.filter(component =>
                      component.toLowerCase().includes(searchTerm.toLowerCase())
                    );

                    if (filteredComponents.length === 0) return null;

                    return (
                      <div key={category}>
                        {selectedCategory === 'All' && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold mb-2">{category}</h3>
                            <p className="text-muted-foreground text-sm">{data.description}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                          {filteredComponents.map(componentName => (
                            <ComponentShowcaseItem
                              key={componentName}
                              componentName={componentName}
                              onCopyCode={copyToClipboard}
                              copiedCode={copiedCode}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </PageLayout>
  );
}

// Individual component showcase item
function ComponentShowcaseItem({ componentName, onCopyCode, copiedCode }) {
  const [showCode, setShowCode] = useState(false);
  const [showProps, setShowProps] = useState(false);

  const getComponentExample = (name) => {
    switch (name) {
      // Basic Components
      case 'Button':
        return {
          component: (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button>Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="destructive">Destructive</Button>
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="info">Info</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button loading>Loading</Button>
                <Button disabled>Disabled</Button>
                <Button leftIcon={<Download className="h-4 w-4" />}>With Icon</Button>
                <Button rightIcon={<ArrowRight className="h-4 w-4" />}>Right Icon</Button>
              </div>
            </div>
          ),
          code: `// Basic variants
<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="destructive">Destructive</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// States
<Button loading>Loading</Button>
<Button disabled>Disabled</Button>

// With icons
<Button leftIcon={<Download />}>Download</Button>
<Button rightIcon={<ArrowRight />}>Next</Button>`,
          props: [
            { name: 'variant', type: 'string', default: 'default', description: 'Button style variant' },
            { name: 'size', type: 'string', default: 'default', description: 'Button size' },
            { name: 'loading', type: 'boolean', default: 'false', description: 'Show loading state' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the button' },
            { name: 'leftIcon', type: 'ReactNode', default: 'undefined', description: 'Icon before text' },
            { name: 'rightIcon', type: 'ReactNode', default: 'undefined', description: 'Icon after text' },
            { name: 'fullWidth', type: 'boolean', default: 'false', description: 'Take full width' },
            { name: 'asChild', type: 'boolean', default: 'false', description: 'Render as child component' }
          ]
        };

      case 'IconButton':
        return {
          component: (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <IconButton icon={<Heart className="h-4 w-4" />} aria-label="Like" />
                <IconButton icon={<Star className="h-4 w-4" />} aria-label="Favorite" variant="secondary" />
                <IconButton icon={<Share className="h-4 w-4" />} aria-label="Share" variant="outline" />
                <IconButton icon={<Settings className="h-4 w-4" />} aria-label="Settings" variant="ghost" />
              </div>
              <div className="flex flex-wrap gap-2">
                <IconButton icon={<Plus className="h-4 w-4" />} aria-label="Add" size="icon-sm" />
                <IconButton icon={<Edit className="h-4 w-4" />} aria-label="Edit" size="icon" />
                <IconButton icon={<Trash className="h-4 w-4" />} aria-label="Delete" size="icon-lg" variant="destructive" />
              </div>
            </div>
          ),
          code: `<IconButton
  icon={<Heart />}
  aria-label="Like"
/>
<IconButton
  icon={<Settings />}
  aria-label="Settings"
  variant="ghost"
/>
<IconButton
  icon={<Trash />}
  aria-label="Delete"
  variant="destructive"
  size="icon-lg"
/>`,
          props: [
            { name: 'icon', type: 'ReactNode', default: 'required', description: 'Icon to display' },
            { name: 'aria-label', type: 'string', default: 'required', description: 'Accessible label' },
            { name: 'variant', type: 'string', default: 'default', description: 'Button style variant' },
            { name: 'size', type: 'string', default: 'icon', description: 'Icon button size' }
          ]
        };

      case 'Badge':
        return {
          component: (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge size="sm">Small</Badge>
                <Badge size="default">Default</Badge>
                <Badge size="lg">Large</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge interactive>Interactive</Badge>
                <Badge interactive variant="outline">Clickable</Badge>
              </div>
            </div>
          ),
          code: `// Basic variants
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>

// Status variants
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="info">Info</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="lg">Large</Badge>

// Interactive
<Badge interactive>Clickable</Badge>`,
          props: [
            { name: 'variant', type: 'string', default: 'default', description: 'Badge style variant' },
            { name: 'size', type: 'string', default: 'default', description: 'Badge size' },
            { name: 'interactive', type: 'boolean', default: 'false', description: 'Make badge clickable' }
          ]
        };

      case 'CountBadge':
        return {
          component: (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Bell className="h-6 w-6" />
                  <CountBadge count={3} className="absolute -top-1 -right-1" />
                </div>
                <div className="relative">
                  <MessageCircle className="h-6 w-6" />
                  <CountBadge count={99} className="absolute -top-1 -right-1" />
                </div>
                <div className="relative">
                  <Mail className="h-6 w-6" />
                  <CountBadge count={150} max={99} className="absolute -top-1 -right-1" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <CountBadge count={0} hideZero />
                <CountBadge count={5} variant="success" />
                <CountBadge count={25} variant="warning" />
              </div>
            </div>
          ),
          code: `// Basic count badge
<CountBadge count={3} />

// With max limit
<CountBadge count={150} max={99} />

// Hide when zero
<CountBadge count={0} hideZero />

// Different variants
<CountBadge count={5} variant="success" />
<CountBadge count={25} variant="warning" />

// Positioned on icon
<div className="relative">
  <Bell className="h-6 w-6" />
  <CountBadge count={3} className="absolute -top-1 -right-1" />
</div>`,
          props: [
            { name: 'count', type: 'number', default: 'required', description: 'Number to display' },
            { name: 'max', type: 'number', default: '99', description: 'Maximum count before showing +' },
            { name: 'hideZero', type: 'boolean', default: 'false', description: 'Hide badge when count is 0' },
            { name: 'variant', type: 'string', default: 'default', description: 'Badge style variant' }
          ]
        };

      case 'StatusBadge':
        return {
          component: (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <StatusBadge status="success">Online</StatusBadge>
                <StatusBadge status="warning">Pending</StatusBadge>
                <StatusBadge status="error">Offline</StatusBadge>
                <StatusBadge status="info">Processing</StatusBadge>
                <StatusBadge status="default">Unknown</StatusBadge>
              </div>
            </div>
          ),
          code: `<StatusBadge status="success">Online</StatusBadge>
<StatusBadge status="warning">Pending</StatusBadge>
<StatusBadge status="error">Offline</StatusBadge>
<StatusBadge status="info">Processing</StatusBadge>
<StatusBadge status="default">Unknown</StatusBadge>`,
          props: [
            { name: 'status', type: 'string', default: 'required', description: 'Status type: success, warning, error, info, default' }
          ]
        };

      case 'Avatar':
        return {
          component: (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 items-center">
                <Avatar>
                  <User className="h-4 w-4" />
                </Avatar>
                <Avatar>
                  <img src="https://github.com/shadcn.png" alt="Avatar" />
                </Avatar>
                <Avatar>
                  <span className="text-sm font-medium">JD</span>
                </Avatar>
              </div>
            </div>
          ),
          code: `// With icon
<Avatar>
  <User className="h-4 w-4" />
</Avatar>

// With image
<Avatar>
  <img src="/avatar.jpg" alt="User" />
</Avatar>

// With initials
<Avatar>
  <span className="text-sm font-medium">JD</span>
</Avatar>`,
          props: [
            { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Avatar content (image, icon, or text)' },
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes' }
          ]
        };

      case 'Separator':
        return {
          component: (
            <div className="space-y-4">
              <div>
                <p>Content above</p>
                <Separator className="my-4" />
                <p>Content below</p>
              </div>
              <div className="flex items-center space-x-4">
                <span>Left</span>
                <Separator orientation="vertical" className="h-4" />
                <span>Right</span>
              </div>
            </div>
          ),
          code: `// Horizontal separator
<Separator />

// Vertical separator
<Separator orientation="vertical" className="h-4" />

// With spacing
<Separator className="my-4" />`,
          props: [
            { name: 'orientation', type: 'string', default: 'horizontal', description: 'Separator orientation' },
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes' }
          ]
        };

      // Layout Components
      case 'Card':
        return {
          component: (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Simple Card</h3>
                <p className="text-muted-foreground">This is a basic card with some content.</p>
              </Card>
              <Card className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <h3 className="font-semibold">User Profile</h3>
                  </div>
                  <p className="text-muted-foreground">Card with header and content sections.</p>
                  <div className="flex space-x-2">
                    <Button size="sm">Edit</Button>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                </div>
              </Card>
            </div>
          ),
          code: `// Simple card
<Card className="p-4">
  <h3 className="font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content goes here.</p>
</Card>

// Card with actions
<Card className="p-6">
  <div className="space-y-4">
    <h3 className="font-semibold">User Profile</h3>
    <p className="text-muted-foreground">Card description.</p>
    <div className="flex space-x-2">
      <Button size="sm">Edit</Button>
      <Button size="sm" variant="outline">View</Button>
    </div>
  </div>
</Card>`,
          props: [
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes' },
            { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Card content' }
          ]
        };

      case 'Container':
        return {
          component: (
            <div className="space-y-4">
              <Container className="border border-dashed border-muted-foreground/50 py-4">
                <p className="text-center text-muted-foreground">Default Container</p>
              </Container>
              <Container size="sm" className="border border-dashed border-muted-foreground/50 py-4">
                <p className="text-center text-muted-foreground">Small Container</p>
              </Container>
            </div>
          ),
          code: `// Default container
<Container>
  <div>Content goes here</div>
</Container>

// Small container
<Container size="sm">
  <div>Narrower content</div>
</Container>`,
          props: [
            { name: 'size', type: 'string', default: 'default', description: 'Container size variant' },
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes' },
            { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Container content' }
          ]
        };

      // Form Components
      case 'Input':
        return {
          component: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Input</Label>
                <Input placeholder="Enter text..." />
              </div>
              <div className="space-y-2">
                <Label>With Icon</Label>
                <Input placeholder="Search..." leftIcon={<Search className="h-4 w-4" />} />
              </div>
              <div className="space-y-2">
                <Label>Clearable Input</Label>
                <Input placeholder="Type to clear..." isClearable />
              </div>
              <div className="space-y-2">
                <Label>Error State</Label>
                <Input placeholder="Invalid input" hasError />
              </div>
              <div className="flex space-x-2">
                <Input placeholder="Small" size="sm" />
                <Input placeholder="Medium" size="md" />
                <Input placeholder="Large" size="lg" />
              </div>
            </div>
          ),
          code: `// Basic input
<Input placeholder="Enter text..." />

// With icon
<Input
  placeholder="Search..."
  leftIcon={<Search className="h-4 w-4" />}
/>

// Clearable
<Input placeholder="Type to clear..." isClearable />

// Error state
<Input placeholder="Invalid input" hasError />

// Different sizes
<Input placeholder="Small" size="sm" />
<Input placeholder="Large" size="lg" />`,
          props: [
            { name: 'placeholder', type: 'string', default: 'undefined', description: 'Input placeholder text' },
            { name: 'size', type: 'string', default: 'md', description: 'Input size: sm, md, lg' },
            { name: 'variant', type: 'string', default: 'default', description: 'Input style variant' },
            { name: 'hasError', type: 'boolean', default: 'false', description: 'Show error state' },
            { name: 'leftIcon', type: 'ReactNode', default: 'undefined', description: 'Icon before input' },
            { name: 'rightIcon', type: 'ReactNode', default: 'undefined', description: 'Icon after input' },
            { name: 'isClearable', type: 'boolean', default: 'false', description: 'Show clear button' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable input' }
          ]
        };

      case 'Label':
        return {
          component: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="required" className="flex items-center">
                  Password <span className="text-destructive ml-1">*</span>
                </Label>
                <Input id="required" type="password" placeholder="Enter password" />
              </div>
            </div>
          ),
          code: `// Basic label
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />

// Required field
<Label htmlFor="password">
  Password <span className="text-destructive">*</span>
</Label>
<Input id="password" type="password" />`,
          props: [
            { name: 'htmlFor', type: 'string', default: 'undefined', description: 'Associated input ID' },
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes' },
            { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Label text' }
          ]
        };

      case 'Switch':
        return {
          component: (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="marketing" defaultChecked />
                <Label htmlFor="marketing">Marketing emails</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="disabled" disabled />
                <Label htmlFor="disabled">Disabled option</Label>
              </div>
            </div>
          ),
          code: `// Basic switch
<Switch id="notifications" />
<Label htmlFor="notifications">Enable notifications</Label>

// Default checked
<Switch id="marketing" defaultChecked />

// Disabled
<Switch id="disabled" disabled />`,
          props: [
            { name: 'checked', type: 'boolean', default: 'undefined', description: 'Controlled checked state' },
            { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Default checked state' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable the switch' },
            { name: 'onCheckedChange', type: 'function', default: 'undefined', description: 'Callback when state changes' }
          ]
        };

      case 'Textarea':
        return {
          component: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Enter your message..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project..."
                  rows={4}
                />
              </div>
              <Textarea placeholder="Disabled textarea" disabled />
            </div>
          ),
          code: `// Basic textarea
<Textarea placeholder="Enter your message..." />

// With custom rows
<Textarea
  placeholder="Describe your project..."
  rows={4}
/>

// Disabled
<Textarea placeholder="Disabled textarea" disabled />`,
          props: [
            { name: 'placeholder', type: 'string', default: 'undefined', description: 'Textarea placeholder' },
            { name: 'rows', type: 'number', default: '3', description: 'Number of visible rows' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable textarea' },
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes' }
          ]
        };

      // Feedback Components
      case 'Progress':
        return {
          component: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Progress: 25%</Label>
                <Progress value={25} />
              </div>
              <div className="space-y-2">
                <Label>Progress: 60%</Label>
                <Progress value={60} />
              </div>
              <div className="space-y-2">
                <Label>Complete</Label>
                <Progress value={100} />
              </div>
            </div>
          ),
          code: `// Basic progress
<Progress value={25} />

// Different values
<Progress value={60} />
<Progress value={100} />

// With label
<div className="space-y-2">
  <Label>Progress: 60%</Label>
  <Progress value={60} />
</div>`,
          props: [
            { name: 'value', type: 'number', default: '0', description: 'Progress value (0-100)' },
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes' }
          ]
        };

      case 'Slider':
        return {
          component: (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Volume: 50</Label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Range: 20-80</Label>
                <Slider defaultValue={[20, 80]} max={100} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Price: $25</Label>
                <Slider defaultValue={[25]} max={100} step={5} />
              </div>
            </div>
          ),
          code: `// Single value slider
<Slider defaultValue={[50]} max={100} step={1} />

// Range slider
<Slider defaultValue={[20, 80]} max={100} step={1} />

// Custom step
<Slider defaultValue={[25]} max={100} step={5} />`,
          props: [
            { name: 'defaultValue', type: 'number[]', default: '[0]', description: 'Default slider value(s)' },
            { name: 'value', type: 'number[]', default: 'undefined', description: 'Controlled slider value(s)' },
            { name: 'max', type: 'number', default: '100', description: 'Maximum value' },
            { name: 'min', type: 'number', default: '0', description: 'Minimum value' },
            { name: 'step', type: 'number', default: '1', description: 'Step increment' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable slider' }
          ]
        };

      case 'Skeleton':
        return {
          component: (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ),
          code: `// Text skeletons
<Skeleton className="h-4 w-[250px]" />
<Skeleton className="h-4 w-[200px]" />

// Avatar with text
<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[150px]" />
    <Skeleton className="h-4 w-[100px]" />
  </div>
</div>

// Card skeleton
<Skeleton className="h-32 w-full" />
<Skeleton className="h-4 w-3/4" />
<Skeleton className="h-4 w-1/2" />`,
          props: [
            { name: 'className', type: 'string', default: 'undefined', description: 'Additional CSS classes for sizing and styling' }
          ]
        };

      default:
        return {
          component: <div className="p-4 text-center text-muted-foreground">Component preview coming soon</div>,
          code: `// ${name} component code`,
          props: []
        };
    }
  };

  const example = getComponentExample(componentName);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{componentName}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProps(!showProps)}
              title="Show Props"
            >
              <Info className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCode(!showCode)}
              title={showCode ? "Hide Code" : "Show Code"}
            >
              {showCode ? <Eye className="h-4 w-4" /> : <CodeIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopyCode(example.code, componentName)}
              title="Copy Code"
            >
              {copiedCode === componentName ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Component Preview */}
        <div className="border rounded-lg p-6 bg-muted/50">
          {example.component}
        </div>

        {/* Props Table */}
        {showProps && example.props && example.props.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b">
              <h4 className="font-semibold text-sm">Props</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-left p-3 font-medium">Default</th>
                    <th className="text-left p-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {example.props.map((prop, index) => (
                    <tr key={prop.name} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/25'}>
                      <td className="p-3 font-mono text-xs">{prop.name}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{prop.type}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground">{prop.default}</td>
                      <td className="p-3 text-xs">{prop.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Code Example */}
        {showCode && (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted px-4 py-2 border-b flex items-center justify-between">
              <h4 className="font-semibold text-sm">Code Example</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopyCode(example.code, componentName)}
                className="h-6 px-2"
              >
                {copiedCode === componentName ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="p-4 bg-slate-950 text-slate-50 overflow-x-auto">
              <pre className="text-sm">
                <code>{example.code}</code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
