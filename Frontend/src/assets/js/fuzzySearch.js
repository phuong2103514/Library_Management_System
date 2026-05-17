/**
 * Chuyển chuỗi tiếng Việt có dấu thành không dấu
 */
 export function removeVietnameseTones(str) {
  if (!str) return '';
  
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  
  // Loại bỏ các ký tự đặc biệt
  str = str.replace(/[^a-z0-9\s]/g, '');
  
  // Loại bỏ khoảng trắng thừa
  str = str.replace(/\s+/g, ' ').trim();
  
  return str;
}

/**
 * Tính độ tương đồng giữa 2 chuỗi (0-100%)
 */
export function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = removeVietnameseTones(str1);
  const s2 = removeVietnameseTones(str2);
  
  if (s1 === s2) return 100;
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  const matrix = [];
  
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1.charAt(i - 1) === s2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  const similarity = ((maxLen - distance) / maxLen) * 100;
  
  return Math.round(similarity);
}

/**
 * Kiểm tra có chứa tất cả từ khóa không
 */
export function containsAllKeywords(text, keywords) {
  if (!text || !keywords) return false;
  
  const normalizedText = removeVietnameseTones(text);
  const keywordArray = keywords.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  
  return keywordArray.every(keyword => {
    const normalizedKeyword = removeVietnameseTones(keyword);
    return normalizedText.includes(normalizedKeyword);
  });
}

/**
 * Tìm kiếm thông minh
 */
export function smartSearch(items, searchText, getFieldValue) {
  if (!searchText || !searchText.trim()) {
    return items;
  }
  
  const normalizedSearch = removeVietnameseTones(searchText);
  const results = [];
  
  items.forEach(item => {
    const fieldValue = getFieldValue(item);
    if (!fieldValue) return;
    
    const normalizedField = removeVietnameseTones(fieldValue);
    
    // 1. Exact match
    if (normalizedField.includes(normalizedSearch)) {
      results.push({
        item,
        score: 100,
        type: 'exact'
      });
      return;
    }
    
    // 2. Keywords match
    if (containsAllKeywords(fieldValue, searchText)) {
      results.push({
        item,
        score: 80,
        type: 'keywords'
      });
      return;
    }
    
    // 3. Fuzzy match
    const similarity = calculateSimilarity(fieldValue, searchText);
    
    if (similarity >= 60) {
      results.push({
        item,
        score: similarity,
        type: 'fuzzy'
      });
    }
  });
  
  results.sort((a, b) => b.score - a.score);
  
  return results.map(r => r.item);
}