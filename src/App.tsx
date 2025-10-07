import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import TaskManager from './pages/TaskManager';
import ClaiChat from './pages/ClaiChat';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/tasks" component={TaskManager} />
          <Route path="/chat" component={ClaiChat} />
          <Route>404 - Not Found</Route>
        </Switch>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;
