import Link from "next/link";
import Head from "next/head";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
      </Head>
      <Navbar></Navbar>
      <Component {...pageProps} />
    </>
  );
}

function Navbar() {
  return (
    <nav class="uk-navbar-container">
      <div class="uk-navbar-left">
        <ul class="uk-navbar-nav">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/galerie">Galerie</Link>
          </li>
          <li>
            <Link href="/kontakt">Kontakt</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default MyApp;
