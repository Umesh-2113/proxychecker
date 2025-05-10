import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method not allowed' });
  }
  
  res.setHeader('Access-Control-Allow-Origin', '*'); // Optional: for CORS
  
  const { proxy } = req.body;
  
  if (!proxy || typeof proxy !== 'string') {
    return res.status(400).json({ status: 'error', message: 'Invalid input' });
  }
  
  const parts = proxy.split(':');
  if (parts.length !== 4) {
    return res.status(400).json({ status: 'error', message: 'Format must be ip:port:username:password' });
  }
  
  const [ip, port, username, password] = parts;
  
  // Function to get location using multiple fallback APIs
  async function getIpLocation(ipAddress) {
    console.log(`Getting location for IP: ${ipAddress}`);
    
    // Try ipinfo.io first
    try {
      const ipinfoResponse = await axios.get(`https://ipinfo.io/${ipAddress}/json`);
      console.log('ipinfo.io response:', ipinfoResponse.data);
      
      if (ipinfoResponse.data && ipinfoResponse.data.city && ipinfoResponse.data.country) {
        const region = ipinfoResponse.data.region && ipinfoResponse.data.country 
          ? `${ipinfoResponse.data.region}, ${ipinfoResponse.data.country}`
          : ipinfoResponse.data.country;
          
        return { 
          success: true, 
          region,
          city: ipinfoResponse.data.city,
          country: ipinfoResponse.data.country,
          timezone: ipinfoResponse.data.timezone || 'Unknown',
          org: ipinfoResponse.data.org || 'Unknown',
          source: 'ipinfo.io'
        };
      }
    } catch (error) {
      console.log(`ipinfo.io error for ${ipAddress}:`, error.message);
    }
    
    // Try ip-api as fallback
    try {
      const ipApiResponse = await axios.get(`http://ip-api.com/json/${ipAddress}`);
      console.log('ip-api.com response:', ipApiResponse.data);
      
      if (ipApiResponse.data && ipApiResponse.data.status === 'success') {
        const region = ipApiResponse.data.regionName && ipApiResponse.data.country 
          ? `${ipApiResponse.data.regionName}, ${ipApiResponse.data.country}`
          : ipApiResponse.data.country;
          
        return { 
          success: true, 
          region,
          city: ipApiResponse.data.city,
          country: ipApiResponse.data.country,
          timezone: ipApiResponse.data.timezone || 'Unknown',
          org: ipApiResponse.data.isp || ipApiResponse.data.org || 'Unknown',
          source: 'ip-api.com'
        };
      } else if (ipApiResponse.data && ipApiResponse.data.status === 'fail') {
        if (ipApiResponse.data.message && ipApiResponse.data.message.includes('private')) {
          return { success: false, region: 'Private IP Range', source: 'ip-api.com' };
        } else {
          return { success: false, region: `Error: ${ipApiResponse.data.message}`, source: 'ip-api.com' };
        }
      }
    } catch (error) {
      console.log(`ip-api.com error for ${ipAddress}:`, error.message);
    }
    
    // Try geoiplookup.io as third option
    try {
      const geoipResponse = await axios.get(`https://json.geoiplookup.io/${ipAddress}`);
      console.log('geoiplookup.io response:', geoipResponse.data);
      
      if (geoipResponse.data && geoipResponse.data.success && geoipResponse.data.country_name) {
        const region = geoipResponse.data.region && geoipResponse.data.country_name 
          ? `${geoipResponse.data.region}, ${geoipResponse.data.country_name}`
          : geoipResponse.data.country_name;
          
        return { 
          success: true, 
          region,
          city: geoipResponse.data.city,
          country: geoipResponse.data.country_name,
          timezone: geoipResponse.data.timezone_name || 'Unknown',
          org: geoipResponse.data.isp || geoipResponse.data.org || 'Unknown',
          source: 'geoiplookup.io'
        };
      }
    } catch (error) {
      console.log(`geoiplookup.io error for ${ipAddress}:`, error.message);
    }
    
    // Check if it's a private/local IP
    if (
      ipAddress.startsWith('10.') || 
      ipAddress.startsWith('192.168.') ||
      (ipAddress.startsWith('172.') && (parseInt(ipAddress.split('.')[1]) >= 16 && parseInt(ipAddress.split('.')[1]) <= 31)) ||
      ipAddress.startsWith('127.') ||
      ipAddress === '::1' ||
      ipAddress.toLowerCase() === 'localhost'
    ) {
      return { success: false, region: 'Private/Local IP Address', source: 'local-check' };
    }
    
    // If all APIs fail
    return { success: false, region: 'Region Unknown', source: 'none' };
  }
  
  try {
    // Get location for the proxy IP first
    const proxyIpLocation = await getIpLocation(ip);
    console.log('Proxy IP location result:', proxyIpLocation);
    
    // Try to check if proxy works
    try {
      console.log(`Testing proxy ${ip}:${port}`);
      const proxyResponse = await axios.get('http://httpbin.org/ip', {
        proxy: {
          host: ip,
          port: parseInt(port),
          auth: { username, password },
          protocol: 'http',
        },
        timeout: 15000,
      });
      
      console.log('Proxy test response:', proxyResponse.data);
      
      if (proxyResponse.status === 200) {
        const clientIp = proxyResponse.data.origin?.split(',')[0];
        console.log(`Proxy working, exit IP: ${clientIp}`);
        
        // Get location for the exit IP
        const exitIpLocation = await getIpLocation(clientIp);
        console.log('Exit IP location result:', exitIpLocation);
        
        return res.status(200).json({
          status: 'success',
          message: 'Proxy is working!',
          ip: clientIp,
          proxyIp: ip,
          proxyRegion: proxyIpLocation.region,
          exitRegion: exitIpLocation.region,
          city: exitIpLocation.city || proxyIpLocation.city,
          country: exitIpLocation.country || proxyIpLocation.country,
          timezone: exitIpLocation.timezone || proxyIpLocation.timezone,
          org: exitIpLocation.org || proxyIpLocation.org,
          proxyLocationSource: proxyIpLocation.source,
          exitLocationSource: exitIpLocation.source
        });
      } else {
        console.log('Proxy test failed with non-200 status');
        return res.status(200).json({ 
          status: 'fail', 
          message: 'Proxy is not working.',
          proxyIp: ip,
          proxyRegion: proxyIpLocation.region,
          city: proxyIpLocation.city,
          country: proxyIpLocation.country,
          timezone: proxyIpLocation.timezone,
          org: proxyIpLocation.org,
          proxyLocationSource: proxyIpLocation.source
        });
      }
    } catch (proxyTestError) {
      console.log('Proxy test error:', proxyTestError.message);
      return res.status(200).json({ 
        status: 'fail', 
        message: 'Proxy is not working: ' + proxyTestError.message,
        proxyIp: ip,
        proxyRegion: proxyIpLocation.region,
        city: proxyIpLocation.city,
        country: proxyIpLocation.country,
        timezone: proxyIpLocation.timezone,
        org: proxyIpLocation.org,
        proxyLocationSource: proxyIpLocation.source
      });
    }
  } catch (error) {
    console.error('Overall handler error:', error.message || error);
    return res.status(200).json({ 
      status: 'fail', 
      message: 'Error checking proxy: ' + error.message,
      proxyIp: ip,
      proxyRegion: 'Error determining region'
    });
  }
}