import { Navbar } from './components';
import { About, Skills, Work, Footer, Header, Testimonials } from './container'

const App = () => {
  return (
    <div className="App">
      <Navbar />
      <Header />
      <App />
      <Skills />
      <Testimonials />
      <Work />
      <About />
      <Footer />
    </div>
  );
}

export default App;
