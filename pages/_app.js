import Link from "next/link";
import Head from "next/head";
import 'tailwindcss/tailwind.css'

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
        <link href="https://fonts.googleapis.com/css2?family=Ubuntu&display=swap" rel="stylesheet"/> 
      </Head>
        <Navbar></Navbar>
        <div className="pt-20 h-screen">
        <Component {...pageProps}/>
        </div>
    </>
  );
}

 function Navbar() {
   return (
     <nav class="w-full h-20 bg-primary fixed flex justify-center items-center">
         <NavItem href="/">Startseite</NavItem>
         <NavItem href="/hinzufuegen">Hinzufügen</NavItem>
     </nav>
   );
 }

 function NavItem(props) {
   return(
     <div className="flex-none mx-10">
    <Link href={props.href}><span  className="text-white font-black text-4xl">{props.children}</span></Link>
    </div>
   );
 }

export default MyApp;
