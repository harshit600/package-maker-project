
export const slugify = (str) => {
    return str
      .toLowerCase()                        
      .trim()                               
      .replace(/\s+/g, '-')                
      .replace(/[^\w\-]+/g, '')             
      .replace(/\-\-+/g, '-')              
      .replace(/^-+/, '')                   
      .replace(/-+$/, '');                  
  }

export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}