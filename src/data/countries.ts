// Supported VAT countries for VIES validation.
// Covers the EU 27 + United Kingdom (GB) and Northern Ireland (XI), which VIES exposes.
//
// Each entry carries four name/tax-term facets:
//   nameZh    - 中文名
//   nameEn    - English name
//   nameNative - 母语名 (endonym). Where a country has several official languages
//                the two most widely used are given, separated by " / ".
//   vatTerm   - what the VAT number is actually called locally. This is the string
//                people search for ("USt-IdNr.", "Partita IVA", "btw-nummer"), so
//                it is far more useful to EU users than a translated country name.
//                Values follow common local business usage; several countries have
//                more than one accepted form, in which case the main one is shown.

export interface CountryInfo {
  /** ISO country code used by VIES (2 letters, uppercase). */
  code: string;
  /** 中文名 */
  nameZh: string;
  /** English name */
  nameEn: string;
  /** 母语名 / endonym (official-language name of the country) */
  nameNative: string;
  /** 当地对 VAT 号的叫法 / what the VAT number is called locally */
  vatTerm: string;
  /** Whether this is an EU member state (vs UK/XI handled separately). */
  eu: boolean;
}

export const COUNTRIES: CountryInfo[] = [
  { code: "AT", nameZh: "奥地利", nameEn: "Austria", nameNative: "Österreich", vatTerm: "UID-Nummer", eu: true },
  { code: "BE", nameZh: "比利时", nameEn: "Belgium", nameNative: "België / Belgique", vatTerm: "BTW-nummer / numéro de TVA", eu: true },
  { code: "BG", nameZh: "保加利亚", nameEn: "Bulgaria", nameNative: "България", vatTerm: "ДДС номер", eu: true },
  { code: "CY", nameZh: "塞浦路斯", nameEn: "Cyprus", nameNative: "Κύπρος / Kıbrıs", vatTerm: "Αριθμός ΦΠΑ", eu: true },
  { code: "CZ", nameZh: "捷克", nameEn: "Czech Republic", nameNative: "Česko", vatTerm: "DIČ", eu: true },
  { code: "DE", nameZh: "德国", nameEn: "Germany", nameNative: "Deutschland", vatTerm: "USt-IdNr.", eu: true },
  { code: "DK", nameZh: "丹麦", nameEn: "Denmark", nameNative: "Danmark", vatTerm: "CVR-nummer", eu: true },
  { code: "EE", nameZh: "爱沙尼亚", nameEn: "Estonia", nameNative: "Eesti", vatTerm: "KMKR number", eu: true },
  { code: "EL", nameZh: "希腊", nameEn: "Greece", nameNative: "Ελλάδα", vatTerm: "Αριθμός ΦΠΑ", eu: true },
  { code: "ES", nameZh: "西班牙", nameEn: "Spain", nameNative: "España", vatTerm: "NIF (IVA)", eu: true },
  { code: "FI", nameZh: "芬兰", nameEn: "Finland", nameNative: "Suomi", vatTerm: "ALV-numero", eu: true },
  { code: "FR", nameZh: "法国", nameEn: "France", nameNative: "France", vatTerm: "numéro de TVA", eu: true },
  { code: "HR", nameZh: "克罗地亚", nameEn: "Croatia", nameNative: "Hrvatska", vatTerm: "PDV broj", eu: true },
  { code: "HU", nameZh: "匈牙利", nameEn: "Hungary", nameNative: "Magyarország", vatTerm: "ÁFA-szám", eu: true },
  { code: "IE", nameZh: "爱尔兰", nameEn: "Ireland", nameNative: "Ireland / Éire", vatTerm: "VAT number", eu: true },
  { code: "IT", nameZh: "意大利", nameEn: "Italy", nameNative: "Italia", vatTerm: "Partita IVA", eu: true },
  { code: "LT", nameZh: "立陶宛", nameEn: "Lithuania", nameNative: "Lietuva", vatTerm: "PVM kodas", eu: true },
  { code: "LU", nameZh: "卢森堡", nameEn: "Luxembourg", nameNative: "Lëtzebuerg / Luxembourg", vatTerm: "numéro TVA", eu: true },
  { code: "LV", nameZh: "拉脱维亚", nameEn: "Latvia", nameNative: "Latvija", vatTerm: "PVN numurs", eu: true },
  { code: "MT", nameZh: "马耳他", nameEn: "Malta", nameNative: "Malta", vatTerm: "VAT number", eu: true },
  { code: "NL", nameZh: "荷兰", nameEn: "Netherlands", nameNative: "Nederland", vatTerm: "btw-nummer", eu: true },
  { code: "PL", nameZh: "波兰", nameEn: "Poland", nameNative: "Polska", vatTerm: "NIP", eu: true },
  { code: "PT", nameZh: "葡萄牙", nameEn: "Portugal", nameNative: "Portugal", vatTerm: "NIF", eu: true },
  { code: "RO", nameZh: "罗马尼亚", nameEn: "Romania", nameNative: "România", vatTerm: "cod de TVA", eu: true },
  { code: "SE", nameZh: "瑞典", nameEn: "Sweden", nameNative: "Sverige", vatTerm: "momsregistreringsnummer", eu: true },
  { code: "SI", nameZh: "斯洛文尼亚", nameEn: "Slovenia", nameNative: "Slovenija", vatTerm: "ID za DDV", eu: true },
  { code: "SK", nameZh: "斯洛伐克", nameEn: "Slovakia", nameNative: "Slovensko", vatTerm: "IČ DPH", eu: true },
  { code: "GB", nameZh: "英国", nameEn: "United Kingdom", nameNative: "United Kingdom", vatTerm: "VAT registration number", eu: false },
  { code: "XI", nameZh: "北爱尔兰", nameEn: "Northern Ireland", nameNative: "Northern Ireland", vatTerm: "VAT registration number (XI)", eu: false },
];

const CODE_SET = new Set(COUNTRIES.map((c) => c.code));

export function isSupportedCountry(code: string): boolean {
  return CODE_SET.has(code.toUpperCase());
}

export function getCountry(code: string): CountryInfo | undefined {
  const up = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === up);
}
