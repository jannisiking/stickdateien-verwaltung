module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'primary': '#89B5AF', //for Navbar
        'secondary': '#96C7C1', 
        'tertiary': '#DED9C4', //absetzungen von weißem Hintergrund in dezent
        'quarternary': '#D0CAB2' //Aktionsfelder wie Buttons
      }
    },
    fontFamily: {
      'sans': ['Ubuntu', 'sans-serif']
     }
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms')
  ]
}
