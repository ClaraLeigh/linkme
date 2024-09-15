// script.js

// URL Dictionary
const urlDictionary = {
  'G': 'https://github.com/',
  'L': 'https://linkedin.com/',
  'X': 'https://x.com/',
  'I': 'https://instagram.com/',
  'F': 'https://facebook.com/',
  'D': 'https://discord.com/'
};

const urlNameDictionary = {
  'G': 'GitHub',
  'L': 'LinkedIn',
  'X': 'Twitter',
  'I': 'Instagram',
  'F': 'Facebook',
  'D': 'Discord'
}

// Theme Dictionary
const themeDictionary = {
  'A': 'light',
  'B': 'dark',
  'C': 'halloween',
  'D': 'dracula',
};

// Get the 'd' parameter from the URL
function getDataFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('d');
}

// Decode data from URL
function decodeData(encodedData) {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(encodedData);
    const [themeCode, avatar, displayName, shortBio, linksStr] = decompressed.split('|');
    const links = linksStr.split(',').map(linkStr => {
      const parts = linkStr.split(':');
      if (parts[0] === 'O') {
        // Custom URL format: O:Name:URL
        return { u: parts[0], n: decodeURIComponent(parts[1]), url: decodeURIComponent(parts[2]) };
      }
      return { u: parts[0], n: decodeURIComponent(parts[1]) };
    });
    return { t: themeCode, a:avatar, d: decodeURIComponent(displayName), b: decodeURIComponent(shortBio), l: links };
  } catch (e) {
    console.error('Failed to decode data:', e);
    return null;
  }
}

// Apply the theme
function applyTheme(themeCode) {
  const themeClass = themeDictionary[themeCode];
  document.documentElement.setAttribute('data-theme', themeClass);
  // if theme is D, then add a background image
  if (themeClass === 'dracula') {
    document.body.style.backgroundImage = 'url("cats.webp")';
    document.body.className = 'bg-cover bg-center min-h-screen flex flex-col items-center justify-center';
    // lets add a slight overlay
    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-black opacity-50';
    document.body.appendChild(overlay);
  }
}

// Render the profile
function renderProfile(avatar, displayName, shortBio) {
  if (avatar && avatar.length > 0) {
    document.getElementById('avatar').style.display = 'block';
    avatar = decodeURIComponent(avatar);
    avatar = decompressUrl(avatar);
    document.getElementById('avatar').src = avatar;
  }
  displayName = decompressText(displayName);
  shortBio = decompressText(shortBio);
  document.getElementById('displayName').textContent = displayName;
  document.getElementById('shortBio').textContent = shortBio;

  // Set the page title, strip bad characters
  document.title = `${displayName} | LinkMe`;
}

// Render the links on the page
function renderLinks(data) {
  const linksContainer = document.getElementById('links');

  data.l.forEach(link => {
    let url = '';
    if (link.u === 'O') {
      url = link.url;
    } else {
      url = urlDictionary[link.u] || link.u;
    }
    const urlName = urlNameDictionary[link.u];
    // const icon = iconDictionary[link.u] || '🔗';
    const a = document.createElement('a');
    a.href = url + link.n;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'btn btn-primary btn-outline btn-sm btn-wide';
    // a.innerHTML = `<span class="link-icon">${icon}</span>${link.n}`;
    a.innerHTML = urlName;
    linksContainer.appendChild(a);
  });
}

// Main function to execute on page load
(function() {
  const encodedData = getDataFromUrl();
  if (encodedData) {
    const data = decodeData(encodedData);
    if (data && data.t && data.d && data.b && data.l) {
      applyTheme(data.t);
      renderProfile(data.a, data.d, data.b);
      renderLinks(data);
    } else {
      document.getElementById('links').innerHTML = '<p class="text-red-500">Invalid or corrupted data.</p>';
      document.getElementById('displayName').textContent = '';
      document.getElementById('shortBio').textContent = '';
    }
  } else {
    document.getElementById('links').innerHTML = '<a href="generate.html" class="link link-primary">Click here to create your own link.</a>';
    document.getElementById('displayName').textContent = 'Hello Friend';
    document.getElementById('shortBio').textContent = 'This is a link sharing site where no data is stored on our servers!';
  }
})();