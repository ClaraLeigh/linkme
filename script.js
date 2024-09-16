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
    return { t: themeCode, a: avatar, d: decodeURIComponent(displayName), b: decodeURIComponent(shortBio), l: links };
  } catch (e) {
    console.error('Failed to decode data:', e);
    return null;
  }
}

// Apply the theme
function applyTheme(themeCode) {
  const themeClass = themeDictionary[themeCode];
  if (themeClass) {
    document.documentElement.setAttribute('data-theme', themeClass);
  } else {
    console.error('Invalid theme code');
  }

  // if theme is D, then add a background image
  if (themeClass === 'dracula') {
    document.body.style.backgroundImage = 'url("cats.webp")';
    document.body.className = 'bg-cover bg-center min-h-screen flex flex-col items-center justify-center';

    const overlay = document.createElement('div');
    overlay.className = 'absolute inset-0 bg-black opacity-50';
    document.body.appendChild(overlay);
  }
}

function isValidUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (e) {
    return false;
  }
}

function setAvatar(avatar) {
  if (!avatar || !avatar.length) {
    return;
  }
  const avatarDecoded = decodeURIComponent(avatar);
  const avatarUrl = decompressUrl(avatarDecoded);

  if (isValidUrl(avatarUrl)) {
    document.getElementById('avatar').style.display = 'block';
    document.getElementById('avatar').src = avatarUrl;
  } else {
    console.error('Invalid avatar URL');
  }
}

function sanitizeUrl(url) {
  const safeUrlPattern = /^(https?:|mailto:|tel:)/i;
  return safeUrlPattern.test(url) ? url : '#';
}

function renderProfile(avatar, displayName, shortBio) {
  setAvatar(avatar);

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
    const a = document.createElement('a');

    a.href = sanitizeUrl(url + link.n);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'btn btn-primary btn-outline btn-sm btn-wide';
    a.textContent = urlName || 'Unknown Link';

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
