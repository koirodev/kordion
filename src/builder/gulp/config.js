const config = {
  version: "2.0.2.1",
  date: getDate(),
  root: "./../",
  autoprefixerConfig: ["last 10 version", "> 90%"]
}

function getDate() {
  const date = new Date();
  const options = { year: 'numeric', month: 'long', day: '2-digit' };
  return date.toLocaleDateString('en-US', options);
}

export default config;
