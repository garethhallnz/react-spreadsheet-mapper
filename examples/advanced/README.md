# Advanced Spreadsheet Mapper

This is the **flagship demonstration** of the Spreadsheet Mapper library, showcasing all advanced features in a comprehensive, production-ready interface.

## 🚀 Features Demonstrated

### 🔒 Security Features
- **File type validation** with MIME type checking
- **File size limits** with user-friendly warnings (50MB default)
- **XSS prevention** through data sanitization
- **Rate limiting** to prevent DoS attacks
- **Secure error handling** that doesn't expose sensitive information

### ⚡ Performance Optimizations
- **Chunked file reading** for large files (prevents browser crashes)
- **Lazy loading** with "Load More" functionality for large datasets
- **Processing throttling** to prevent browser overload
- **Memory optimization** with preview-only processing
- **Real-time performance metrics** tracking file size, processing time, and memory usage

### ♿ Accessibility Features
- **WCAG 2.1 AA compliant** interface
- **Skip links** for complex interfaces
- **Screen reader announcements** for state changes
- **ARIA live regions** for dynamic content updates
- **Keyboard navigation** support (Tab, Enter, Escape)
- **High contrast mode** compatibility
- **Color-independent indicators** with text labels and icons
- **Proper heading hierarchy** and semantic HTML

### 🎨 Advanced UI Patterns
- **Progressive enhancement** with loading states
- **Real-time validation** with inline feedback
- **Announcement history** for debugging accessibility
- **Performance dashboard** with metrics visualization
- **Categorized error handling** (security vs validation errors)
- **Focus management** for screen reader users

## 🛠 Running the Example

```bash
npm run start:example:advanced
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## 💡 Use Cases

This example is perfect for:
- **Advanced applications** requiring security and compliance
- **High-volume data processing** with performance monitoring
- **Accessibility-first** applications
- **Production deployments** requiring robust error handling
- **Learning advanced patterns** for spreadsheet processing

## 📚 Comparison with Other Examples

- **Minimal Example**: Basic functionality only
- **Framework Examples** (Material-UI, Ant Design, etc.): Simple implementations showing framework integration
- **Advanced**: Complete feature demonstration with production-ready patterns

## 🧪 Testing the Features

1. **Upload sample.csv** to see basic functionality
2. **Try large files** to see chunked processing and performance metrics
3. **Use keyboard navigation** to test accessibility
4. **Check console** for security validation in action
5. **Test with screen readers** to experience announcements

This example serves as both a demonstration and a template for implementing advanced spreadsheet processing in your applications.
