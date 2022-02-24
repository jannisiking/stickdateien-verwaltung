import Link from "next/link";
import Head from "next/head";
import '../styles/output.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head> //KOmmentar zum testen
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu&display=swap" rel="stylesheet"/> 
      </Head>
        <Navbar></Navbar>
        <div className="pt-20 h-screen bg-fuchsia-100">
        <Component {...pageProps}/>
        </div>
    </>
  );
}

 function Navbar() {
   return (
     <nav className="w-full h-20 bg-pink-500 fixed flex justify-center items-center">
         <NavItem href="/">Startseite</NavItem>
         <NavItem href="/hinzufuegen">Hinzufügen</NavItem>
     </nav>
   );
 }

 function NavItem(props) {
   return(
     <div className="flex-none mx-10 cursor-pointer">
    <Link href={props.href}><span  className="text-white font-black text-4xl">{props.children}</span></Link>
    </div>
   );
 }

export default MyApp;
