# Component Showcase - Bellyfed Design System

A comprehensive component library and design system showcase that displays all available UI components with interactive examples, theme testing, and documentation.

## 🎯 Purpose

The Component Showcase serves as:
- **Developer Reference**: See what components are available and how to use them
- **Design System Validation**: Ensure visual consistency across light/dark themes
- **Testing Ground**: Verify all pages use correct design patterns and components
- **Living Documentation**: Interactive examples with real-world use cases

## 🚀 Features

### 1. **Component Discovery**
- Automatically displays all reusable UI components from `@bellyfed/ui`
- Organized by logical categories (Basic, Forms, Navigation, etc.)
- Search functionality to quickly find specific components
- Component statistics and overview

### 2. **Visual Documentation**
- Multiple usage examples for each component
- Different variants, states, and configurations
- Real-world examples using restaurant/food industry context
- Interactive components that respond to user actions

### 3. **Theme Testing**
- Built-in theme toggle (Light/Dark/System)
- Verify all components render correctly in both themes
- Consistent color schemes and contrast ratios
- Theme-aware component examples

### 4. **Interactive Examples**
- Buttons are clickable with loading states
- Forms are functional with validation
- Dialogs and modals can be opened
- Toast notifications can be triggered
- All interactive elements work as expected

### 5. **Responsive Preview**
- Test components at different screen sizes
- Mobile, Tablet, Laptop, and Desktop breakpoints
- Responsive behavior validation
- Layout consistency across devices

### 6. **Accessibility Testing**
- Accessibility panel with testing options
- High contrast mode toggle
- Reduced motion preferences
- Focus indicator visibility
- Font size adjustment
- Screen reader mode simulation

### 7. **Code Examples**
- View source code for each component
- Copy-to-clipboard functionality
- Import statements and usage patterns
- Best practices and conventions

## 📱 Access

Visit the component showcase at: `/components`

Example: `http://localhost:3001/components`

## 🎨 Component Categories

### Basic Components
- **Button**: Various variants, sizes, states, and with icons
- **Card**: Simple cards, user cards, stats cards
- **Badge**: Status indicators, labels, with icons
- **Avatar**: Different sizes, with images, fallbacks, status indicators
- **Separator**: Visual dividers

### Form Controls
- **Input**: Text, email, password, with icons, validation states
- **Label**: Basic labels, required fields, with icons
- **Textarea**: Different sizes, states, character counting
- **Select**: Basic select, with icons, grouped options
- **Switch**: Settings panels, toggle states
- **RadioGroup**: Basic groups, payment methods, with icons
- **Slider**: Volume controls, price ranges, ratings
- **SearchField**: Search inputs with autocomplete

### Navigation
- **Tabs**: Basic tabs, restaurant menu navigation
- **DropdownMenu**: User menus, action menus, with icons
- **Breadcrumb**: Navigation paths

### Feedback
- **Progress**: Loading bars, completion indicators, different states
- **Skeleton**: Loading placeholders, card skeletons, list skeletons
- **Toast**: Success, error, warning, info notifications with actions
- **AlertDialog**: Confirmation dialogs, destructive actions

### Overlays
- **Dialog**: Edit forms, booking dialogs, complex interactions
- **Sheet**: Side panels, filter panels, navigation drawers
- **Popover**: Info panels, form controls, rich content
- **Tooltip**: Basic tooltips, rich tooltips, action hints

### Data Display
- **Table**: Restaurant listings, menu items, data tables
- **Calendar**: Date pickers, booking calendars, disabled dates
- **Command**: Command palettes, search interfaces, keyboard shortcuts

### Layout
- **Container**: Page containers, content wrappers
- **PageHeader**: Page titles, breadcrumbs, actions
- **ScrollArea**: Scrollable content areas
- **Collapsible**: Expandable content sections

## 🛠 Usage Examples

### Viewing Components
1. Navigate to `/components`
2. Select a category from the sidebar
3. Browse through component examples
4. Click "Expand" to see detailed examples

### Testing Themes
1. Use the theme toggle in the header
2. Switch between Light, Dark, and System themes
3. Verify all components look correct in each theme
4. Check color contrast and readability

### Responsive Testing
1. Switch to "Responsive" view mode
2. Select different device breakpoints
3. Observe how components adapt to different screen sizes
4. Ensure layouts remain functional and attractive

### Accessibility Testing
1. Click the accessibility icon in the header
2. Enable different accessibility features
3. Test high contrast mode
4. Adjust font sizes
5. Verify focus indicators are visible

### Code Reference
1. Switch to "Code" view mode
2. View implementation examples
3. Copy code snippets to clipboard
4. Use as reference for implementing components

## 🎯 Restaurant Industry Context

All examples use restaurant and food industry context to make them relevant:
- Restaurant listings and menus
- Booking and reservation systems
- Review and rating displays
- Food delivery interfaces
- Restaurant management tools

## 📊 Component Statistics

The sidebar displays:
- Total number of components
- Number of categories
- Current theme
- Current view mode
- Quick actions (export list, reset view)

## 🔧 Development

### Adding New Components
1. Add the component to `@bellyfed/ui`
2. Import it in the showcase page
3. Add it to the appropriate category in `componentCategories`
4. Create an example function (e.g., `NewComponentExamples`)
5. Add the case to the `renderComponentExamples` switch statement

### Adding New Categories
1. Add the category to `componentCategories` object
2. Include icon, description, and component list
3. The sidebar will automatically update

### Customizing Examples
Each component has its own example function that demonstrates:
- Basic usage
- Different variants and states
- Real-world scenarios
- Interactive behavior
- Best practices

## 🎨 Design Principles

- **Consistency**: All components follow the same design patterns
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Responsiveness**: Works on all device sizes
- **Theme Support**: Seamless light/dark mode switching
- **Performance**: Optimized for fast loading and smooth interactions
- **Developer Experience**: Clear examples and easy-to-copy code

## 🚀 Future Enhancements

- [ ] Component usage analytics
- [ ] Export design tokens
- [ ] Figma integration
- [ ] Component testing playground
- [ ] Performance metrics
- [ ] Automated accessibility testing
- [ ] Component dependency graph
- [ ] Version history and changelog
- [ ] Custom theme builder
- [ ] Component composition examples

## 📝 Notes

- The showcase is built with Next.js 15 and uses the existing `@bellyfed/ui` components
- All examples are interactive and functional
- The page is optimized for development use and should not be included in production builds
- Theme switching is handled by `next-themes` for consistent behavior
- All icons are from `lucide-react` for consistency

---

**Built with ❤️ for the Bellyfed development team**
