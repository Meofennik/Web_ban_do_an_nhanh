/**
 * Vietnamese Accent-Insensitive Search & Relevance Scoring Helper
 */

function makeVietnameseRegex(str) {
  if (!str) return new RegExp('', 'i');
  // Escape regex special chars
  const escaped = str.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const map = {
    'a': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'à': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'á': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ạ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ả': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ã': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'â': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ầ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ấ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ậ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ẩ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ẫ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ă': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ằ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ắ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ặ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ẳ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'ẵ': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
    'e': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'è': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'é': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'ẹ': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'ẻ': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'ẽ': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'ê': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'ề': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'ế': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'ệ': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'ể': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'ễ': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
    'i': '[iìíịỉĩIÌÍỊỈĨ]',
    'ì': '[iìíịỉĩIÌÍỊỈĨ]',
    'í': '[iìíịỉĩIÌÍỊỈĨ]',
    'ị': '[iìíịỉĩIÌÍỊỈĨ]',
    'ỉ': '[iìíịỉĩIÌÍỊỈĨ]',
    'ĩ': '[iìíịỉĩIÌÍỊỈĨ]',
    'o': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ò': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ó': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ọ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ỏ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'õ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ô': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ồ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ố': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ộ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ổ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ỗ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ơ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ờ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ớ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ợ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ở': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'ỡ': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
    'u': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ù': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ú': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ụ': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ủ': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ũ': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ư': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ừ': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ứ': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ự': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ử': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'ữ': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
    'y': '[yỳýỵỷỹYỲÝỴỶỸ]',
    'ỳ': '[yỳýỵỷỹYỲÝỴỶỸ]',
    'ý': '[yỳýỵỷỹYỲÝỴỶỸ]',
    'ỵ': '[yỳýỵỷỹYỲÝỴỶỸ]',
    'ỷ': '[yỳýỵỷỹYỲÝỴỶỸ]',
    'ỹ': '[yỳýỵỷỹYỲÝỴỶỸ]',
    'd': '[dđDĐ]',
    'đ': '[dđDĐ]'
  };

  let regexPattern = '';
  for (let char of escaped.toLowerCase()) {
    if (map[char]) {
      regexPattern += map[char];
    } else {
      regexPattern += char;
    }
  }
  return new RegExp(regexPattern, 'i');
}

function removeVietnameseAccents(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

function calculateRelevanceScore(product, query) {
  if (!query) return 0;
  const rawQ = query.toLowerCase().trim();
  const normalizedQ = removeVietnameseAccents(query);

  const rawName = (product.name || '').toLowerCase();
  const normalizedName = removeVietnameseAccents(product.name || '');

  const rawCat = (product.category || '').toLowerCase();
  const normalizedCat = removeVietnameseAccents(product.category || '');

  const rawStore = (product.storeName || '').toLowerCase();
  const normalizedStore = removeVietnameseAccents(product.storeName || '');

  const rawDesc = (product.description || '').toLowerCase();
  const normalizedDesc = removeVietnameseAccents(product.description || '');

  let score = 0;

  // 1. Exact match with original accent
  if (rawName === rawQ) score += 100;
  else if (normalizedName === normalizedQ) score += 90;

  // 2. Starts with query
  else if (rawName.startsWith(rawQ)) score += 70;
  else if (normalizedName.startsWith(normalizedQ)) score += 60;

  // 3. Name contains query
  else if (rawName.includes(rawQ)) score += 45;
  else if (normalizedName.includes(normalizedQ)) score += 40;

  // 4. Category match
  if (rawCat.includes(rawQ) || normalizedCat.includes(normalizedQ)) score += 30;

  // 5. Store match
  if (rawStore.includes(rawQ) || normalizedStore.includes(normalizedQ)) score += 20;

  // 6. Description match
  if (rawDesc.includes(rawQ) || normalizedDesc.includes(normalizedQ)) score += 10;

  return score;
}

module.exports = {
  makeVietnameseRegex,
  removeVietnameseAccents,
  calculateRelevanceScore
};

