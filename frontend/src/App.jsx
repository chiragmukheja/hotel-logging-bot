import RequestList from './components/RequestList';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white font-sans">
      <header className="text-center py-6 border-b border-gray-800">
        <h1 className="text-4xl font-bold text-yellow-400 tracking-wide">
          LuxeStay Guest Dashboard
        </h1>
        <p className="text-gray-400 mt-1">Manage and monitor guest service requests efficiently</p>
      </header>
      <main className="px-4 sm:px-6 md:px-10 py-8 max-w-4xl mx-auto">
        <RequestList />
      </main>
    </div>
  );
}

export default App;
