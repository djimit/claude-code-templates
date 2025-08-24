---
allowed-tools: Read, Write, Edit, Bash
argument-hint: [platform] | --docusaurus | --gitbook | --notion | --storybook | --jupyter | --comprehensive
description: Create interactive documentation with live examples, code playgrounds, and user engagement features
model: sonnet
---

# Interactive Documentation Platform

Create interactive documentation with live examples: $ARGUMENTS

## Current Documentation Infrastructure

- Static site generators: !`find . -name "docusaurus.config.js" -o -name "gatsby-config.js" -o -name "_config.yml" | head -3`
- Documentation framework: @docs/ or @website/ (detect existing setup)
- Component libraries: !`find . -name "*.stories.*" | head -5` (Storybook detection)
- Interactive examples: !`find . -name "*.ipynb" -o -name "*playground*" | head -3`
- Hosting setup: @vercel.json or @netlify.toml or @.github/workflows/ (if exists)

## Task

Build comprehensive interactive documentation platform with live examples, code playgrounds, and user engagement features.

## Interactive Documentation Architecture

### 1. **Platform Selection and Setup**

#### Docusaurus Configuration
```javascript
// docusaurus.config.js
const config = {
  title: 'Interactive Documentation',
  tagline: 'Documentation that comes alive',
  url: 'https://docs.example.com',
  baseUrl: '/',
  
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/username/repo/tree/main/website/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}],
          ],
        },
        blog: {
          showReadingTime: true,
          remarkPlugins: [
            [require('@docusaurus/remark-plugin-npm2yarn'), {sync: true}],
          ],
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'api',
        path: 'api',
        routeBasePath: 'api',
        sidebarPath: require.resolve('./sidebars-api.js'),
      },
    ],
    '@docusaurus/plugin-ideal-image',
    [
      '@docusaurus/plugin-pwa',
      {
        debug: true,
        offlineModeActivationStrategies: [
          'appInstalled',
          'queryString',
        ],
        pwaHead: [
          { tagName: 'link', rel: 'icon', href: '/img/docusaurus.png' },
          { tagName: 'link', rel: 'manifest', href: '/manifest.json' },
          { tagName: 'meta', name: 'theme-color', content: 'rgb(37, 194, 160)' },
        ],
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Interactive Docs',
      logo: { alt: 'Logo', src: 'img/logo.svg' },
      items: [
        { type: 'doc', docId: 'intro', position: 'left', label: 'Tutorial' },
        { to: '/api/intro', label: 'API', position: 'left' },
        { to: '/blog', label: 'Blog', position: 'left' },
        { to: '/playground', label: 'Playground', position: 'left' },
        {
          href: 'https://github.com/username/repo',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Tutorial', to: '/docs/intro' },
            { label: 'API Reference', to: '/api/intro' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Stack Overflow', href: 'https://stackoverflow.com/questions/tagged/docusaurus' },
            { label: 'Discord', href: 'https://discordapp.com/invite/docusaurus' },
            { label: 'Twitter', href: 'https://twitter.com/docusaurus' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },

    prism: {
      theme: require('prism-react-renderer/themes/github'),
      darkTheme: require('prism-react-renderer/themes/dracula'),
      additionalLanguages: ['java', 'python', 'bash', 'json'],
    },

    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
      contextualSearch: true,
      searchParameters: {},
      searchPagePath: 'search',
    },
  },
};

module.exports = config;
```

### 2. **Live Code Playground Integration**

#### React Live Code Editor
```jsx
// src/components/LiveCodeBlock/index.js
import React from 'react';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import { usePrismTheme } from '@docusaurus/theme-common';

const LiveCodeBlock = ({ children, transformCode, ...props }) => {
  const prismTheme = usePrismTheme();
  
  return (
    <div className="live-code-block">
      <LiveProvider
        code={children.replace(/\n$/, '')}
        transformCode={transformCode || ((code) => `${code};`)}
        theme={prismTheme}
        {...props}
      >
        <div className="live-code-editor">
          <LiveEditor />
        </div>
        <div className="live-code-preview">
          <LivePreview />
        </div>
        <LiveError />
      </LiveProvider>
    </div>
  );
};

export default LiveCodeBlock;
```

#### API Playground Component
```jsx
// src/components/APIPlayground/index.js
import React, { useState } from 'react';
import axios from 'axios';
import CodeBlock from '@theme/CodeBlock';

const APIPlayground = ({ endpoint, method = 'GET', parameters = [] }) => {
  const [params, setParams] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeRequest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const config = {
        method: method.toLowerCase(),
        url: endpoint,
        ...params,
      };
      
      const result = await axios(config);
      setResponse(result);
    } catch (err) {
      setError(err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="api-playground">
      <div className="api-config">
        <h4>{method} {endpoint}</h4>
        
        {parameters.map((param) => (
          <div key={param.name} className="parameter">
            <label>{param.name} ({param.type})</label>
            <input
              type={param.type === 'number' ? 'number' : 'text'}
              placeholder={param.description}
              value={params[param.name] || ''}
              onChange={(e) => setParams({
                ...params,
                [param.name]: e.target.value
              })}
            />
          </div>
        ))}
        
        <button onClick={executeRequest} disabled={loading}>
          {loading ? 'Executing...' : 'Try it out'}
        </button>
      </div>
      
      {response && (
        <div className="api-response">
          <h5>Response:</h5>
          <CodeBlock language="json">
            {JSON.stringify(response.data, null, 2)}
          </CodeBlock>
        </div>
      )}
      
      {error && (
        <div className="api-error">
          <h5>Error:</h5>
          <CodeBlock language="json">
            {JSON.stringify(error.data || error.message, null, 2)}
          </CodeBlock>
        </div>
      )}
    </div>
  );
};

export default APIPlayground;
```

### 3. **Interactive Tutorial System**

#### Step-by-Step Tutorial Component
```jsx
// src/components/InteractiveTutorial/index.js
import React, { useState } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

const InteractiveTutorial = ({ steps }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const markStepComplete = (stepIndex) => {
    setCompletedSteps(prev => new Set([...prev, stepIndex]));
    if (stepIndex === currentStep && stepIndex < steps.length - 1) {
      setCurrentStep(stepIndex + 1);
    }
  };

  const resetTutorial = () => {
    setCurrentStep(0);
    setCompletedSteps(new Set());
  };

  return (
    <div className="interactive-tutorial">
      <div className="tutorial-header">
        <h3>Interactive Tutorial</h3>
        <div className="progress">
          <div 
            className="progress-bar" 
            style={{ width: `${(completedSteps.size / steps.length) * 100}%` }}
          />
        </div>
        <div className="step-counter">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      <div className="tutorial-content">
        <Tabs>
          {steps.map((step, index) => (
            <TabItem
              key={index}
              value={`step-${index}`}
              label={`${completedSteps.has(index) ? '✓' : ''} ${step.title}`}
              attributes={{
                className: index === currentStep ? 'active-step' : 
                          completedSteps.has(index) ? 'completed-step' : ''
              }}
            >
              <div className="step-content">
                <div className="step-description">
                  {step.description}
                </div>
                
                {step.code && (
                  <div className="step-code">
                    <h5>Code Example:</h5>
                    <CodeBlock language={step.language || 'javascript'}>
                      {step.code}
                    </CodeBlock>
                  </div>
                )}
                
                {step.task && (
                  <div className="step-task">
                    <h5>Your Task:</h5>
                    <p>{step.task}</p>
                    <button 
                      onClick={() => markStepComplete(index)}
                      className="complete-step-btn"
                    >
                      Mark as Complete
                    </button>
                  </div>
                )}
                
                {step.validation && (
                  <div className="step-validation">
                    <h5>Validation:</h5>
                    <pre>{step.validation}</pre>
                  </div>
                )}
              </div>
            </TabItem>
          ))}
        </Tabs>
      </div>

      <div className="tutorial-footer">
        <button onClick={resetTutorial} className="reset-btn">
          Reset Tutorial
        </button>
        <div className="tutorial-progress">
          {completedSteps.size} of {steps.length} steps completed
        </div>
      </div>
    </div>
  );
};

export default InteractiveTutorial;
```

### 4. **Component Documentation with Storybook Integration**

#### Storybook Configuration
```javascript
// .storybook/main.js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-controls',
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-viewport',
    {
      name: '@storybook/addon-docs',
      options: {
        configureJSX: true,
        babelOptions: {},
        sourceLoaderOptions: null,
      },
    },
  ],
  features: {
    jsxInPreview: true,
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => (prop.parent ? !/node_modules/.test(prop.parent.fileName) : true),
    },
  },
};
```

#### Interactive Component Story
```jsx
// src/components/Button/Button.stories.js
import React from 'react';
import { Button } from './Button';

export default {
  title: 'Example/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and interactive states.',
      },
    },
  },
  argTypes: {
    backgroundColor: { control: 'color' },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
};

const Template = (args) => <Button {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large = Template.bind({});
Large.args = {
  size: 'large',
  label: 'Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};

// Interactive playground story
export const Playground = Template.bind({});
Playground.args = {
  primary: true,
  label: 'Click me!',
  size: 'medium',
};
Playground.parameters = {
  docs: {
    source: {
      type: 'dynamic',
    },
  },
};
```

### 5. **Documentation Analytics and User Feedback**

#### Analytics Integration
```javascript
// src/plugins/analytics.js
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';

export default (function() {
  if (!ExecutionEnvironment.canUseDOM) {
    return null;
  }

  return {
    onRouteUpdate({ location, previousLocation }) {
      // Track page views
      if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: location.pathname,
        });
        gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href,
          page_path: location.pathname,
        });
      }

      // Track documentation engagement
      if (location.pathname.startsWith('/docs/')) {
        trackDocumentationEngagement(location.pathname);
      }
    },
  };
});

const trackDocumentationEngagement = (path) => {
  // Track time on page, scroll depth, etc.
  let startTime = Date.now();
  let maxScroll = 0;

  const trackScroll = () => {
    const scrollPercent = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    maxScroll = Math.max(maxScroll, scrollPercent);
  };

  window.addEventListener('scroll', trackScroll);
  
  window.addEventListener('beforeunload', () => {
    const timeSpent = Date.now() - startTime;
    
    if (typeof gtag !== 'undefined') {
      gtag('event', 'doc_engagement', {
        event_category: 'Documentation',
        event_label: path,
        value: Math.round(timeSpent / 1000), // seconds
        custom_parameters: {
          max_scroll_percent: maxScroll,
        },
      });
    }
  });
};
```

#### Feedback Widget
```jsx
// src/components/FeedbackWidget/index.js
import React, { useState } from 'react';
import styles from './styles.module.css';

const FeedbackWidget = ({ pageId }) => {
  const [rating, setRating] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitFeedback = async () => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageId,
          rating,
          feedback,
          url: window.location.pathname,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (submitted) {
    return (
      <div className={styles.feedbackWidget}>
        <div className={styles.thankYou}>
          <h4>Thank you for your feedback! 🎉</h4>
          <p>Your input helps us improve the documentation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.feedbackWidget}>
      <h4>Was this page helpful?</h4>
      
      <div className={styles.ratingButtons}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`${styles.starButton} ${rating >= star ? styles.active : ''}`}
          >
            ⭐
          </button>
        ))}
      </div>
      
      <textarea
        placeholder="Tell us how we can improve this page..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className={styles.feedbackText}
      />
      
      <button 
        onClick={submitFeedback}
        disabled={!rating}
        className={styles.submitButton}
      >
        Submit Feedback
      </button>
    </div>
  );
};

export default FeedbackWidget;
```

### 6. **Advanced Interactive Features**

#### Documentation Search with Algolia
```javascript
// docusaurus.config.js - Algolia search configuration
module.exports = {
  themeConfig: {
    algolia: {
      appId: 'YOUR_APP_ID',
      apiKey: 'YOUR_SEARCH_API_KEY',
      indexName: 'YOUR_INDEX_NAME',
      contextualSearch: true,
      externalUrlRegex: 'external\\.com|domain\\.com',
      searchParameters: {
        facetFilters: ['type:content'],
      },
      searchPagePath: 'search',
      insights: true,
    },
  },
};
```

#### Interactive Code Tabs with Live Preview
```jsx
// src/components/CodeTabs/index.js
import React, { useState } from 'react';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';
import LiveCodeBlock from '../LiveCodeBlock';

const CodeTabs = ({ examples, livePreview = false }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="code-tabs-container">
      <Tabs
        defaultValue={examples[0].language}
        values={examples.map((example, index) => ({
          label: example.label || example.language,
          value: example.language + index,
        }))}
      >
        {examples.map((example, index) => (
          <TabItem key={index} value={example.language + index}>
            <div className="code-example">
              <div className="code-header">
                <span className="language">{example.language}</span>
                {example.filename && (
                  <span className="filename">{example.filename}</span>
                )}
              </div>
              
              {livePreview && example.language === 'jsx' ? (
                <LiveCodeBlock
                  scope={{ React }}
                  noInline={example.noInline}
                >
                  {example.code}
                </LiveCodeBlock>
              ) : (
                <CodeBlock language={example.language}>
                  {example.code}
                </CodeBlock>
              )}
              
              {example.explanation && (
                <div className="code-explanation">
                  <h5>Explanation:</h5>
                  <p>{example.explanation}</p>
                </div>
              )}
            </div>
          </TabItem>
        ))}
      </Tabs>
    </div>
  );
};

export default CodeTabs;
```

### 7. **Documentation Deployment and CI/CD**

#### GitHub Actions Deployment
```yaml
# .github/workflows/docs-deploy.yml
name: Deploy Documentation

on:
  push:
    branches: [main]
    paths: ['docs/**', 'website/**']
  pull_request:
    branches: [main]
    paths: ['docs/**', 'website/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      with:
        fetch-depth: 0

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build documentation
      run: npm run build

    - name: Test build
      run: npm run serve:test

    - name: Deploy to GitHub Pages
      if: github.ref == 'refs/heads/main'
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build

    - name: Notify deployment
      if: github.ref == 'refs/heads/main'
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: 'Documentation deployed successfully! 🚀'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 8. **Performance Optimization**

#### Bundle Optimization Configuration
```javascript
// docusaurus.config.js - Performance optimizations
module.exports = {
  webpack: {
    jsLoader: (isServer) => ({
      loader: require.resolve('swc-loader'),
      options: {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
          target: 'es2017',
        },
        module: {
          type: isServer ? 'commonjs' : 'es6',
        },
      },
    }),
  },
  
  plugins: [
    [
      '@docusaurus/plugin-pwa',
      {
        debug: true,
        offlineModeActivationStrategies: [
          'appInstalled',
          'queryString',
        ],
        pwaHead: [
          { tagName: 'link', rel: 'icon', href: '/img/docusaurus.png' },
          { tagName: 'link', rel: 'manifest', href: '/manifest.json' },
          { tagName: 'meta', name: 'theme-color', content: 'rgb(37, 194, 160)' },
          { tagName: 'meta', name: 'apple-mobile-web-app-capable', content: 'yes' },
          { tagName: 'meta', name: 'apple-mobile-web-app-status-bar-style', content: '#000' },
        ],
      },
    ],
  ],

  future: {
    experimental_faster: true,
  },
};
```

This interactive documentation platform provides a comprehensive solution for creating engaging, user-friendly documentation with live examples, interactive tutorials, and comprehensive user feedback systems. The platform supports multiple frameworks and can be customized for any project type.