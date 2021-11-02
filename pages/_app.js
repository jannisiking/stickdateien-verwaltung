import Link from "next/Link";
import Head from "next/Head";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/uikit@3.8.0/dist/css/uikit.min.css"
        />
      </Head>
      <Navbar></Navbar>
      <Component {...pageProps} />
      <script src="https://cdn.jsdelivr.net/npm/uikit@3.8.0/dist/js/uikit.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/uikit@3.8.0/dist/js/uikit-icons.min.js"></script>
    </>
  );
}

function Navbar() {
  return (
    <nav class="uk-navbar-container" uk-navbar>
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
