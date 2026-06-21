export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };

            // biome-ignore-all lint: generated-content
            // biome-ignore-all format: generated-content
        
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
  Upload: { input: any; output: any; }
};

export type AdminUserMarketplaceRegion = {
  __typename?: 'AdminUserMarketplaceRegion';
  code: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  permissions: Array<Permission>;
  token: Scalars['String']['output'];
};

export type Administrator = Node & {
  __typename?: 'Administrator';
  createdAt: Scalars['DateTime']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  identifier: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type ApiError = {
  errorCode: ErrorCode;
  message: Scalars['String']['output'];
};

export type Asset = Node & {
  __typename?: 'Asset';
  createdAt: Scalars['DateTime']['output'];
  fileSize: Scalars['Int']['output'];
  focalPoint?: Maybe<Coordinate>;
  height: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  languageCode: LanguageCode;
  mimetype: Scalars['String']['output'];
  name: Scalars['String']['output'];
  previewIdentifier: Scalars['String']['output'];
  sourceIdentifier: Scalars['String']['output'];
  translations: Array<AssetTranslation>;
  type: AssetType;
  updatedAt: Scalars['DateTime']['output'];
  width: Scalars['Int']['output'];
};

export type AssetFilterParameter = {
  createdAt?: InputMaybe<DateTimeFilterInput>;
  fileSize?: InputMaybe<NumericFilterInput>;
  height?: InputMaybe<NumericFilterInput>;
  id?: InputMaybe<IdentifierFilterInput>;
  languageCode?: InputMaybe<TextFilterInput>;
  mimetype?: InputMaybe<TextFilterInput>;
  name?: InputMaybe<TextFilterInput>;
  previewIdentifier?: InputMaybe<TextFilterInput>;
  sourceIdentifier?: InputMaybe<TextFilterInput>;
  type?: InputMaybe<TextFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
  width?: InputMaybe<NumericFilterInput>;
};

export type AssetList = PaginatedList & {
  __typename?: 'AssetList';
  items: Array<Asset>;
  totalItemsCount: Scalars['Int']['output'];
};

export type AssetListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<AssetFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<FilterGroupOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<AssetSortParameter>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  tagsOperator?: InputMaybe<FilterGroupOperator>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type AssetSortParameter = {
  createdAt?: InputMaybe<SortDirection>;
  fileSize?: InputMaybe<SortDirection>;
  height?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  mimetype?: InputMaybe<SortDirection>;
  name?: InputMaybe<SortDirection>;
  previewIdentifier?: InputMaybe<SortDirection>;
  sourceIdentifier?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
  width?: InputMaybe<SortDirection>;
};

export type AssetTranslation = {
  __typename?: 'AssetTranslation';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  languageCode: LanguageCode;
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AssetTranslationInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  languageCode: LanguageCode;
  name?: InputMaybe<Scalars['String']['input']>;
};

export enum AssetType {
  BINARY = 'BINARY',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO'
}

export type AssignAssetsToMarketplaceInput = {
  assetIds: Array<Scalars['ID']['input']>;
  marketplaceId: Scalars['ID']['input'];
};

export type AuthenticateAdminUserResult = AuthenticatedAdminUser | InvalidCredentialsError;

export type AuthenticatedAdminUser = AuthenticatedUser & {
  __typename?: 'AuthenticatedAdminUser';
  id: Scalars['ID']['output'];
  identifier: Scalars['String']['output'];
  marketplaceRegions: Array<AdminUserMarketplaceRegion>;
};

export type AuthenticatedUser = {
  id: Scalars['ID']['output'];
  identifier: Scalars['String']['output'];
};

export type AuthenticationInput = {
  native?: InputMaybe<NativeAuthInput>;
};

/** Filtering operations available for boolean fields. */
export type BooleanFilterInput = {
  /** Matches the exact boolean value. */
  equals?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filters values based on whether the field is null. */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
};

/**
 * Filtering operations for fields containing a list of boolean values.
 * Checks whether the provided boolean value exists inside the stored list.
 */
export type BooleanListFilterInput = {
  /** Returns records where the list contains the specified boolean value. */
  inList: Scalars['Boolean']['input'];
};

export type Company = Node & {
  __typename?: 'Company';
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  token: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Coordinate = {
  __typename?: 'Coordinate';
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type CoordinateInput = {
  x: Scalars['Float']['input'];
  y: Scalars['Float']['input'];
};

export type CreateAssetsInput = {
  file: Scalars['Upload']['input'];
  translations?: InputMaybe<Array<AssetTranslationInput>>;
};

export type CreateAssetsResult = Asset | InvalidMimetypeError;

export type CreateRoleInput = {
  code: Scalars['String']['input'];
  companyId?: InputMaybe<Scalars['ID']['input']>;
  description: Scalars['String']['input'];
  marketplaceRegionIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  permissions: Array<Permission>;
};

export type CreateRoleResult = Role | RoleCodeConflictError;

export enum CurrencyCode {
  /** United Arab Emirates dirham */
  AED = 'AED',
  /** Afghan afghani */
  AFN = 'AFN',
  /** Albanian lek */
  ALL = 'ALL',
  /** Armenian dram */
  AMD = 'AMD',
  /** Netherlands Antillean guilder */
  ANG = 'ANG',
  /** Angolan kwanza */
  AOA = 'AOA',
  /** Argentine peso */
  ARS = 'ARS',
  /** Australian dollar */
  AUD = 'AUD',
  /** Aruban florin */
  AWG = 'AWG',
  /** Azerbaijani manat */
  AZN = 'AZN',
  /** Bosnia and Herzegovina convertible mark */
  BAM = 'BAM',
  /** Barbados dollar */
  BBD = 'BBD',
  /** Bangladeshi taka */
  BDT = 'BDT',
  /** Bulgarian lev */
  BGN = 'BGN',
  /** Bahraini dinar */
  BHD = 'BHD',
  /** Burundian franc */
  BIF = 'BIF',
  /** Bermudian dollar */
  BMD = 'BMD',
  /** Brunei dollar */
  BND = 'BND',
  /** Boliviano */
  BOB = 'BOB',
  /** Brazilian real */
  BRL = 'BRL',
  /** Bahamian dollar */
  BSD = 'BSD',
  /** Bhutanese ngultrum */
  BTN = 'BTN',
  /** Botswana pula */
  BWP = 'BWP',
  /** Belarusian ruble */
  BYN = 'BYN',
  /** Belize dollar */
  BZD = 'BZD',
  /** Canadian dollar */
  CAD = 'CAD',
  /** Congolese franc */
  CDF = 'CDF',
  /** Swiss franc */
  CHF = 'CHF',
  /** Chilean peso */
  CLP = 'CLP',
  /** Renminbi (Chinese) yuan */
  CNY = 'CNY',
  /** Colombian peso */
  COP = 'COP',
  /** Costa Rican colon */
  CRC = 'CRC',
  /** Cuban convertible peso */
  CUC = 'CUC',
  /** Cuban peso */
  CUP = 'CUP',
  /** Cape Verde escudo */
  CVE = 'CVE',
  /** Czech koruna */
  CZK = 'CZK',
  /** Djiboutian franc */
  DJF = 'DJF',
  /** Danish krone */
  DKK = 'DKK',
  /** Dominican peso */
  DOP = 'DOP',
  /** Algerian dinar */
  DZD = 'DZD',
  /** Egyptian pound */
  EGP = 'EGP',
  /** Eritrean nakfa */
  ERN = 'ERN',
  /** Ethiopian birr */
  ETB = 'ETB',
  /** Euro */
  EUR = 'EUR',
  /** Fiji dollar */
  FJD = 'FJD',
  /** Falkland Islands pound */
  FKP = 'FKP',
  /** Pound sterling */
  GBP = 'GBP',
  /** Georgian lari */
  GEL = 'GEL',
  /** Ghanaian cedi */
  GHS = 'GHS',
  /** Gibraltar pound */
  GIP = 'GIP',
  /** Gambian dalasi */
  GMD = 'GMD',
  /** Guinean franc */
  GNF = 'GNF',
  /** Guatemalan quetzal */
  GTQ = 'GTQ',
  /** Guyanese dollar */
  GYD = 'GYD',
  /** Hong Kong dollar */
  HKD = 'HKD',
  /** Honduran lempira */
  HNL = 'HNL',
  /** Croatian kuna */
  HRK = 'HRK',
  /** Haitian gourde */
  HTG = 'HTG',
  /** Hungarian forint */
  HUF = 'HUF',
  /** Indonesian rupiah */
  IDR = 'IDR',
  /** Israeli new shekel */
  ILS = 'ILS',
  /** Indian rupee */
  INR = 'INR',
  /** Iraqi dinar */
  IQD = 'IQD',
  /** Iranian rial */
  IRR = 'IRR',
  /** Icelandic króna */
  ISK = 'ISK',
  /** Jamaican dollar */
  JMD = 'JMD',
  /** Jordanian dinar */
  JOD = 'JOD',
  /** Japanese yen */
  JPY = 'JPY',
  /** Kenyan shilling */
  KES = 'KES',
  /** Kyrgyzstani som */
  KGS = 'KGS',
  /** Cambodian riel */
  KHR = 'KHR',
  /** Comoro franc */
  KMF = 'KMF',
  /** North Korean won */
  KPW = 'KPW',
  /** South Korean won */
  KRW = 'KRW',
  /** Kuwaiti dinar */
  KWD = 'KWD',
  /** Cayman Islands dollar */
  KYD = 'KYD',
  /** Kazakhstani tenge */
  KZT = 'KZT',
  /** Lao kip */
  LAK = 'LAK',
  /** Lebanese pound */
  LBP = 'LBP',
  /** Sri Lankan rupee */
  LKR = 'LKR',
  /** Liberian dollar */
  LRD = 'LRD',
  /** Lesotho loti */
  LSL = 'LSL',
  /** Libyan dinar */
  LYD = 'LYD',
  /** Moroccan dirham */
  MAD = 'MAD',
  /** Moldovan leu */
  MDL = 'MDL',
  /** Malagasy ariary */
  MGA = 'MGA',
  /** Macedonian denar */
  MKD = 'MKD',
  /** Myanmar kyat */
  MMK = 'MMK',
  /** Mongolian tögrög */
  MNT = 'MNT',
  /** Macanese pataca */
  MOP = 'MOP',
  /** Mauritanian ouguiya */
  MRU = 'MRU',
  /** Mauritian rupee */
  MUR = 'MUR',
  /** Maldivian rufiyaa */
  MVR = 'MVR',
  /** Malawian kwacha */
  MWK = 'MWK',
  /** Mexican peso */
  MXN = 'MXN',
  /** Malaysian ringgit */
  MYR = 'MYR',
  /** Mozambican metical */
  MZN = 'MZN',
  /** Namibian dollar */
  NAD = 'NAD',
  /** Nigerian naira */
  NGN = 'NGN',
  /** Nicaraguan córdoba */
  NIO = 'NIO',
  /** Norwegian krone */
  NOK = 'NOK',
  /** Nepalese rupee */
  NPR = 'NPR',
  /** New Zealand dollar */
  NZD = 'NZD',
  /** Omani rial */
  OMR = 'OMR',
  /** Panamanian balboa */
  PAB = 'PAB',
  /** Peruvian sol */
  PEN = 'PEN',
  /** Papua New Guinean kina */
  PGK = 'PGK',
  /** Philippine peso */
  PHP = 'PHP',
  /** Pakistani rupee */
  PKR = 'PKR',
  /** Polish złoty */
  PLN = 'PLN',
  /** Paraguayan guaraní */
  PYG = 'PYG',
  /** Qatari riyal */
  QAR = 'QAR',
  /** Romanian leu */
  RON = 'RON',
  /** Serbian dinar */
  RSD = 'RSD',
  /** Russian ruble */
  RUB = 'RUB',
  /** Rwandan franc */
  RWF = 'RWF',
  /** Saudi riyal */
  SAR = 'SAR',
  /** Solomon Islands dollar */
  SBD = 'SBD',
  /** Seychelles rupee */
  SCR = 'SCR',
  /** Sudanese pound */
  SDG = 'SDG',
  /** Swedish krona/kronor */
  SEK = 'SEK',
  /** Singapore dollar */
  SGD = 'SGD',
  /** Saint Helena pound */
  SHP = 'SHP',
  /** Sierra Leonean leone */
  SLL = 'SLL',
  /** Somali shilling */
  SOS = 'SOS',
  /** Surinamese dollar */
  SRD = 'SRD',
  /** South Sudanese pound */
  SSP = 'SSP',
  /** São Tomé and Príncipe dobra */
  STN = 'STN',
  /** Salvadoran colón */
  SVC = 'SVC',
  /** Syrian pound */
  SYP = 'SYP',
  /** Swazi lilangeni */
  SZL = 'SZL',
  /** Thai baht */
  THB = 'THB',
  /** Tajikistani somoni */
  TJS = 'TJS',
  /** Turkmenistan manat */
  TMT = 'TMT',
  /** Tunisian dinar */
  TND = 'TND',
  /** Tongan paʻanga */
  TOP = 'TOP',
  /** Turkish lira */
  TRY = 'TRY',
  /** Trinidad and Tobago dollar */
  TTD = 'TTD',
  /** New Taiwan dollar */
  TWD = 'TWD',
  /** Tanzanian shilling */
  TZS = 'TZS',
  /** Ukrainian hryvnia */
  UAH = 'UAH',
  /** Ugandan shilling */
  UGX = 'UGX',
  /** United States dollar */
  USD = 'USD',
  /** Uruguayan peso */
  UYU = 'UYU',
  /** Uzbekistan som */
  UZS = 'UZS',
  /** Venezuelan bolívar soberano */
  VES = 'VES',
  /** Vietnamese đồng */
  VND = 'VND',
  /** Vanuatu vatu */
  VUV = 'VUV',
  /** Samoan tala */
  WST = 'WST',
  /** CFA franc BEAC */
  XAF = 'XAF',
  /** East Caribbean dollar */
  XCD = 'XCD',
  /** CFA franc BCEAO */
  XOF = 'XOF',
  /** CFP franc (franc Pacifique) */
  XPF = 'XPF',
  /** Yemeni rial */
  YER = 'YER',
  /** South African rand */
  ZAR = 'ZAR',
  /** Zambian kwacha */
  ZMW = 'ZMW',
  /** Zimbabwean dollar */
  ZWL = 'ZWL'
}

/**
 * Filtering operations for fields containing a list of date/time values.
 * Checks whether the provided date exists inside the stored list.
 */
export type DateListFilterInput = {
  /** Returns records where the list contains the specified date/time value. */
  inList: Scalars['DateTime']['input'];
};

/** Filtering operations available for date/time fields. */
export type DateTimeFilterInput = {
  /** Matches values occurring after the provided date/time. */
  after?: InputMaybe<Scalars['DateTime']['input']>;
  /** Matches values occurring before the provided date/time. */
  before?: InputMaybe<Scalars['DateTime']['input']>;
  /** Matches the exact date/time value. */
  equals?: InputMaybe<Scalars['DateTime']['input']>;
  /** Filters values based on whether the field is null. */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Matches values within the provided inclusive date/time range. */
  withinRange?: InputMaybe<DateTimeRangeInput>;
};

/** Represents a date/time range with inclusive boundaries. */
export type DateTimeRangeInput = {
  /** Earliest allowed date/time (inclusive). */
  from: Scalars['DateTime']['input'];
  /** Latest allowed date/time (inclusive). */
  to: Scalars['DateTime']['input'];
};

export type DeleteAssetInput = {
  deleteFromAllMarketplaces?: InputMaybe<Scalars['Boolean']['input']>;
  force?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
};

export type DeleteAssetsInput = {
  deleteFromAllMarketplaces?: InputMaybe<Scalars['Boolean']['input']>;
  force?: InputMaybe<Scalars['Boolean']['input']>;
  ids: Array<Scalars['ID']['input']>;
};

/** Result type returned from any deletion mutation */
export type DeletionResponse = {
  __typename?: 'DeletionResponse';
  message?: Maybe<Scalars['String']['output']>;
  result: DeletionResult;
};

export enum DeletionResult {
  /** Indicates that an entity was deleted successfully */
  DELETED = 'DELETED',
  /** Indicates that an entity wasn't deleted successfully and the reason is given in the message */
  NOT_DELETED = 'NOT_DELETED'
}

export enum ErrorCode {
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/** Controls how multiple filter groups are combined together. */
export enum FilterGroupOperator {
  AND = 'AND',
  OR = 'OR'
}

/** Filtering operations available for identifier fields. */
export type IdentifierFilterInput = {
  /** Matches identifiers exactly. */
  equals?: InputMaybe<Scalars['String']['input']>;
  /** Excludes any identifier from the provided list. */
  excludedFrom?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Matches any identifier from the provided list. */
  includedIn?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Filters values based on whether the field is null. */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Excludes identifiers that match exactly. */
  notEquals?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Filtering operations for fields containing a list of identifier values.
 * Checks whether the provided identifier exists inside the stored list.
 */
export type IdentifierListFilterInput = {
  /** Returns records where the list contains the specified identifier. */
  inList: Scalars['ID']['input'];
};

/** Returned if the credentials provided by the user are not valid */
export type InvalidCredentialsError = ApiError & {
  __typename?: 'InvalidCredentialsError';
  authenticationError: Scalars['String']['output'];
  errorCode: ErrorCode;
  message: Scalars['String']['output'];
};

export type InvalidMimetypeError = ApiError & {
  __typename?: 'InvalidMimetypeError';
  errorCode: ErrorCode;
  fileName: Scalars['String']['output'];
  message: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
};

export enum LanguageCode {
  /** Afrikaans */
  af = 'af',
  /** Akan */
  ak = 'ak',
  /** Amharic */
  am = 'am',
  /** Arabic */
  ar = 'ar',
  /** Assamese */
  as = 'as',
  /** Azerbaijani */
  az = 'az',
  /** Belarusian */
  be = 'be',
  /** Bulgarian */
  bg = 'bg',
  /** Bambara */
  bm = 'bm',
  /** Bangla */
  bn = 'bn',
  /** Tibetan */
  bo = 'bo',
  /** Breton */
  br = 'br',
  /** Bosnian */
  bs = 'bs',
  /** Catalan */
  ca = 'ca',
  /** Chechen */
  ce = 'ce',
  /** Corsican */
  co = 'co',
  /** Czech */
  cs = 'cs',
  /** Church Slavic */
  cu = 'cu',
  /** Welsh */
  cy = 'cy',
  /** Danish */
  da = 'da',
  /** German */
  de = 'de',
  /** Austrian German */
  de_AT = 'de_AT',
  /** Swiss High German */
  de_CH = 'de_CH',
  /** Dzongkha */
  dz = 'dz',
  /** Ewe */
  ee = 'ee',
  /** Greek */
  el = 'el',
  /** English */
  en = 'en',
  /** Australian English */
  en_AU = 'en_AU',
  /** Canadian English */
  en_CA = 'en_CA',
  /** British English */
  en_GB = 'en_GB',
  /** American English */
  en_US = 'en_US',
  /** Esperanto */
  eo = 'eo',
  /** Spanish */
  es = 'es',
  /** European Spanish */
  es_ES = 'es_ES',
  /** Mexican Spanish */
  es_MX = 'es_MX',
  /** Estonian */
  et = 'et',
  /** Basque */
  eu = 'eu',
  /** Persian */
  fa = 'fa',
  /** Dari */
  fa_AF = 'fa_AF',
  /** Fulah */
  ff = 'ff',
  /** Finnish */
  fi = 'fi',
  /** Faroese */
  fo = 'fo',
  /** French */
  fr = 'fr',
  /** Canadian French */
  fr_CA = 'fr_CA',
  /** Swiss French */
  fr_CH = 'fr_CH',
  /** Western Frisian */
  fy = 'fy',
  /** Irish */
  ga = 'ga',
  /** Scottish Gaelic */
  gd = 'gd',
  /** Galician */
  gl = 'gl',
  /** Gujarati */
  gu = 'gu',
  /** Manx */
  gv = 'gv',
  /** Hausa */
  ha = 'ha',
  /** Hebrew */
  he = 'he',
  /** Hindi */
  hi = 'hi',
  /** Croatian */
  hr = 'hr',
  /** Haitian Creole */
  ht = 'ht',
  /** Hungarian */
  hu = 'hu',
  /** Armenian */
  hy = 'hy',
  /** Interlingua */
  ia = 'ia',
  /** Indonesian */
  id = 'id',
  /** Igbo */
  ig = 'ig',
  /** Sichuan Yi */
  ii = 'ii',
  /** Icelandic */
  is = 'is',
  /** Italian */
  it = 'it',
  /** Japanese */
  ja = 'ja',
  /** Javanese */
  jv = 'jv',
  /** Georgian */
  ka = 'ka',
  /** Kikuyu */
  ki = 'ki',
  /** Kazakh */
  kk = 'kk',
  /** Kalaallisut */
  kl = 'kl',
  /** Khmer */
  km = 'km',
  /** Kannada */
  kn = 'kn',
  /** Korean */
  ko = 'ko',
  /** Kashmiri */
  ks = 'ks',
  /** Kurdish */
  ku = 'ku',
  /** Cornish */
  kw = 'kw',
  /** Kyrgyz */
  ky = 'ky',
  /** Latin */
  la = 'la',
  /** Luxembourgish */
  lb = 'lb',
  /** Ganda */
  lg = 'lg',
  /** Lingala */
  ln = 'ln',
  /** Lao */
  lo = 'lo',
  /** Lithuanian */
  lt = 'lt',
  /** Luba-Katanga */
  lu = 'lu',
  /** Latvian */
  lv = 'lv',
  /** Malagasy */
  mg = 'mg',
  /** Maori */
  mi = 'mi',
  /** Macedonian */
  mk = 'mk',
  /** Malayalam */
  ml = 'ml',
  /** Mongolian */
  mn = 'mn',
  /** Marathi */
  mr = 'mr',
  /** Malay */
  ms = 'ms',
  /** Maltese */
  mt = 'mt',
  /** Burmese */
  my = 'my',
  /** Norwegian Bokmål */
  nb = 'nb',
  /** North Ndebele */
  nd = 'nd',
  /** Nepali */
  ne = 'ne',
  /** Dutch */
  nl = 'nl',
  /** Flemish */
  nl_BE = 'nl_BE',
  /** Norwegian Nynorsk */
  nn = 'nn',
  /** Nyanja */
  ny = 'ny',
  /** Oromo */
  om = 'om',
  /** Odia */
  or = 'or',
  /** Ossetic */
  os = 'os',
  /** Punjabi */
  pa = 'pa',
  /** Polish */
  pl = 'pl',
  /** Pashto */
  ps = 'ps',
  /** Portuguese */
  pt = 'pt',
  /** Brazilian Portuguese */
  pt_BR = 'pt_BR',
  /** European Portuguese */
  pt_PT = 'pt_PT',
  /** Quechua */
  qu = 'qu',
  /** Romansh */
  rm = 'rm',
  /** Rundi */
  rn = 'rn',
  /** Romanian */
  ro = 'ro',
  /** Moldavian */
  ro_MD = 'ro_MD',
  /** Russian */
  ru = 'ru',
  /** Kinyarwanda */
  rw = 'rw',
  /** Sanskrit */
  sa = 'sa',
  /** Sindhi */
  sd = 'sd',
  /** Northern Sami */
  se = 'se',
  /** Sango */
  sg = 'sg',
  /** Sinhala */
  si = 'si',
  /** Slovak */
  sk = 'sk',
  /** Slovenian */
  sl = 'sl',
  /** Samoan */
  sm = 'sm',
  /** Shona */
  sn = 'sn',
  /** Somali */
  so = 'so',
  /** Albanian */
  sq = 'sq',
  /** Serbian */
  sr = 'sr',
  /** Southern Sotho */
  st = 'st',
  /** Sundanese */
  su = 'su',
  /** Swedish */
  sv = 'sv',
  /** Swahili */
  sw = 'sw',
  /** Congo Swahili */
  sw_CD = 'sw_CD',
  /** Tamil */
  ta = 'ta',
  /** Telugu */
  te = 'te',
  /** Tajik */
  tg = 'tg',
  /** Thai */
  th = 'th',
  /** Tigrinya */
  ti = 'ti',
  /** Turkmen */
  tk = 'tk',
  /** Tongan */
  to = 'to',
  /** Turkish */
  tr = 'tr',
  /** Tatar */
  tt = 'tt',
  /** Uyghur */
  ug = 'ug',
  /** Ukrainian */
  uk = 'uk',
  /** Urdu */
  ur = 'ur',
  /** Uzbek */
  uz = 'uz',
  /** Vietnamese */
  vi = 'vi',
  /** Volapük */
  vo = 'vo',
  /** Wolof */
  wo = 'wo',
  /** Xhosa */
  xh = 'xh',
  /** Yiddish */
  yi = 'yi',
  /** Yoruba */
  yo = 'yo',
  /** Chinese */
  zh = 'zh',
  /** Simplified Chinese */
  zh_Hans = 'zh_Hans',
  /** Traditional Chinese */
  zh_Hant = 'zh_Hant',
  /** Zulu */
  zu = 'zu'
}

export type MarketplaceRegion = Node & {
  __typename?: 'MarketplaceRegion';
  availableCurrencyCodes: Array<CurrencyCode>;
  availableLanguageCodes?: Maybe<Array<LanguageCode>>;
  code: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  primaryCurrencyCode: CurrencyCode;
  primaryLanguageCode: LanguageCode;
  token: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type MarketplaceRegionFilterParameter = {
  code?: InputMaybe<TextFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  id?: InputMaybe<IdentifierFilterInput>;
  primaryCurrencyCode?: InputMaybe<TextFilterInput>;
  primaryLanguageCode?: InputMaybe<TextFilterInput>;
  token?: InputMaybe<TextFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type MarketplaceRegionList = PaginatedList & {
  __typename?: 'MarketplaceRegionList';
  items: Array<MarketplaceRegion>;
  totalItemsCount: Scalars['Int']['output'];
};

export type MarketplaceRegionListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<MarketplaceRegionFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<FilterGroupOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<MarketplaceRegionSortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type MarketplaceRegionSortParameter = {
  code?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  token?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Assign assets to marketplace region */
  assignAssetsToMarketplace: Array<Asset>;
  /** Authenticates an admin user using the provided authentication strategy name and data */
  authenticateAdminUser: AuthenticateAdminUserResult;
  /** Create new assets */
  createAssets: Array<CreateAssetsResult>;
  /** Create a new Role */
  createRole: CreateRoleResult;
  /** Delete asset */
  deleteAsset: DeletionResponse;
  /** Delete assets */
  deleteAssets: DeletionResponse;
  /** Delete an existing Role */
  deleteRole: DeletionResponse;
  /** Delete multiple Roles */
  deleteRoles: Array<DeletionResponse>;
  login: Scalars['Boolean']['output'];
  /** Terminates the current admin user session */
  logoutAdminUser: Success;
  /** Update asset */
  updateAsset: Asset;
  updateGlobalSettings?: Maybe<Scalars['Boolean']['output']>;
  /** Update an existing Role */
  updateRole: UpdateRoleResult;
};


export type MutationAssignAssetsToMarketplaceArgs = {
  input: AssignAssetsToMarketplaceInput;
};


export type MutationAuthenticateAdminUserArgs = {
  input: AuthenticationInput;
  rememberMe?: InputMaybe<Scalars['Boolean']['input']>;
};


export type MutationCreateAssetsArgs = {
  input: Array<CreateAssetsInput>;
};


export type MutationCreateRoleArgs = {
  input: CreateRoleInput;
};


export type MutationDeleteAssetArgs = {
  input: DeleteAssetInput;
};


export type MutationDeleteAssetsArgs = {
  input: DeleteAssetsInput;
};


export type MutationDeleteRoleArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteRolesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type MutationLoginArgs = {
  username?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateAssetArgs = {
  input: UpdateAssetInput;
};


export type MutationUpdateGlobalSettingsArgs = {
  input: UpdateGlobalSettingsInput;
};


export type MutationUpdateRoleArgs = {
  input: UpdateRoleInput;
};

export type NativeAuthInput = {
  identifier: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Node = {
  id: Scalars['ID']['output'];
};

/**
 * Filtering operations available for numeric fields.
 * Supports integers, floats, decimal, and money-like values.
 */
export type NumericFilterInput = {
  /** Matches values exactly. */
  equals?: InputMaybe<Scalars['Float']['input']>;
  /** Matches values strictly greater than the provided value. */
  greaterThan?: InputMaybe<Scalars['Float']['input']>;
  /** Matches values greater than or equal to the provided value. */
  greaterThanOrEqual?: InputMaybe<Scalars['Float']['input']>;
  /** Filters values based on whether the field is null. */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Matches values strictly less than the provided value. */
  lessThan?: InputMaybe<Scalars['Float']['input']>;
  /** Matches values less than or equal to the provided value. */
  lessThanOrEqual?: InputMaybe<Scalars['Float']['input']>;
  /** Matches values within the provided inclusive range. */
  withinRange?: InputMaybe<NumericRangeInput>;
};

/**
 * Filtering operations for fields containing a list of numeric values.
 * Checks whether the provided number exists inside the stored list.
 */
export type NumericListFilterInput = {
  /** Returns records where the list contains the specified numeric value. */
  inList: Scalars['Float']['input'];
};

/** Represents a numeric range with inclusive boundaries. */
export type NumericRangeInput = {
  /** Maximum allowed value (inclusive). */
  max: Scalars['Float']['input'];
  /** Minimum allowed value (inclusive). */
  min: Scalars['Float']['input'];
};

export type PaginatedList = {
  items: Array<Node>;
  totalItemsCount: Scalars['Int']['output'];
};

/**
 *
 * Defines the set of access rules recognized by the system.
 *
 * These values are typically used by runtime guards or interceptors
 * to determine whether an operation may be executed.
 *
 * Certain access keys may require additional contextual checks
 * beyond static evaluation.
 */
export enum Permission {
  /** Allows read on Company */
  company_company_read = 'company_company_read',
  /** Grants permission to create Order */
  company_order_create = 'company_order_create',
  /** Grants permission to delete Order */
  company_order_delete = 'company_order_delete',
  /** Grants permission to read Order */
  company_order_read = 'company_order_read',
  /** Grants permission to update Order */
  company_order_update = 'company_order_update',
  /** Grants permission to create Role */
  company_role_create = 'company_role_create',
  /** Grants permission to delete Role */
  company_role_delete = 'company_role_delete',
  /** Grants permission to read Role */
  company_role_read = 'company_role_read',
  /** Grants permission to update Role */
  company_role_update = 'company_role_update',
  /** Grants permission to create Administrator */
  platform_administrator_create = 'platform_administrator_create',
  /** Grants permission to delete Administrator */
  platform_administrator_delete = 'platform_administrator_delete',
  /** Grants permission to read Administrator */
  platform_administrator_read = 'platform_administrator_read',
  /** Grants permission to update Administrator */
  platform_administrator_update = 'platform_administrator_update',
  /** Grants permission to create Asset */
  platform_asset_create = 'platform_asset_create',
  /** Grants permission to delete Asset */
  platform_asset_delete = 'platform_asset_delete',
  /** Grants permission to read Asset */
  platform_asset_read = 'platform_asset_read',
  /** Grants permission to update Asset */
  platform_asset_update = 'platform_asset_update',
  /** Grants permission to create Catalog */
  platform_catalog_create = 'platform_catalog_create',
  /** Grants permission to delete Catalog */
  platform_catalog_delete = 'platform_catalog_delete',
  /** Grants permission to read Catalog */
  platform_catalog_read = 'platform_catalog_read',
  /** Grants permission to update Catalog */
  platform_catalog_update = 'platform_catalog_update',
  /** Grants permission to create Company */
  platform_company_create = 'platform_company_create',
  /** Grants permission to delete Company */
  platform_company_delete = 'platform_company_delete',
  /** Grants permission to read Company */
  platform_company_read = 'platform_company_read',
  /** Grants permission to update Company */
  platform_company_update = 'platform_company_update',
  /** Grants permission to create Marketplace_Region */
  platform_marketplace_region_create = 'platform_marketplace_region_create',
  /** Grants permission to delete Marketplace_Region */
  platform_marketplace_region_delete = 'platform_marketplace_region_delete',
  /** Grants permission to read Marketplace_Region */
  platform_marketplace_region_read = 'platform_marketplace_region_read',
  /** Grants permission to update Marketplace_Region */
  platform_marketplace_region_update = 'platform_marketplace_region_update',
  /** Grants permission to create Order */
  platform_order_create = 'platform_order_create',
  /** Grants permission to delete Order */
  platform_order_delete = 'platform_order_delete',
  /** Grants permission to read Order */
  platform_order_read = 'platform_order_read',
  /** Grants permission to update Order */
  platform_order_update = 'platform_order_update',
  /** Grants permission to create Role */
  platform_role_create = 'platform_role_create',
  /** Grants permission to delete Role */
  platform_role_delete = 'platform_role_delete',
  /** Grants permission to read Role */
  platform_role_read = 'platform_role_read',
  /** Grants permission to update Role */
  platform_role_update = 'platform_role_update'
}

export type Query = {
  __typename?: 'Query';
  activeAdministrator?: Maybe<Administrator>;
  activeMarketplaceRegion: MarketplaceRegion;
  /** Get single asset by id */
  asset?: Maybe<Asset>;
  /** Get a list of assets */
  assets: AssetList;
  marketplaceRegions: MarketplaceRegionList;
  me?: Maybe<AuthenticatedAdminUser>;
  me2: Scalars['Boolean']['output'];
  role?: Maybe<Role>;
  roles: RoleList;
};


export type QueryAssetArgs = {
  id: Scalars['ID']['input'];
};


export type QueryAssetsArgs = {
  options?: InputMaybe<AssetListOptions>;
};


export type QueryMarketplaceRegionsArgs = {
  options?: InputMaybe<MarketplaceRegionListOptions>;
};


export type QueryRoleArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRolesArgs = {
  options?: InputMaybe<RoleListOptions>;
};

export type Role = Node & {
  __typename?: 'Role';
  code: Scalars['String']['output'];
  company?: Maybe<Company>;
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  marketplaceRegions: Array<MarketplaceRegion>;
  permissions: Array<Permission>;
  updatedAt: Scalars['DateTime']['output'];
};

export type RoleCodeConflictError = ApiError & {
  __typename?: 'RoleCodeConflictError';
  errorCode: ErrorCode;
  message: Scalars['String']['output'];
};

export type RoleFilterParameter = {
  code?: InputMaybe<TextFilterInput>;
  createdAt?: InputMaybe<DateTimeFilterInput>;
  description?: InputMaybe<TextFilterInput>;
  id?: InputMaybe<IdentifierFilterInput>;
  updatedAt?: InputMaybe<DateTimeFilterInput>;
};

export type RoleList = PaginatedList & {
  __typename?: 'RoleList';
  items: Array<Role>;
  totalItemsCount: Scalars['Int']['output'];
};

export type RoleListOptions = {
  /** Allows the results to be filtered */
  filter?: InputMaybe<RoleFilterParameter>;
  /** Specifies whether multiple top-level "filter" fields should be combined with a logical AND or OR operation. Defaults to AND. */
  filterOperator?: InputMaybe<FilterGroupOperator>;
  /** Skips the first n results, for use in pagination */
  skip?: InputMaybe<Scalars['Int']['input']>;
  /** Specifies which properties to sort the results by */
  sort?: InputMaybe<RoleSortParameter>;
  /** Takes n results, for use in pagination */
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type RoleSortParameter = {
  code?: InputMaybe<SortDirection>;
  createdAt?: InputMaybe<SortDirection>;
  description?: InputMaybe<SortDirection>;
  id?: InputMaybe<SortDirection>;
  updatedAt?: InputMaybe<SortDirection>;
};

/** Controls the ordering direction for sorted results. */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

export type Success = {
  __typename?: 'Success';
  success: Scalars['Boolean']['output'];
};

/** Filtering operations available for text-based fields. */
export type TextFilterInput = {
  /** Matches values containing the provided substring. */
  contains?: InputMaybe<Scalars['String']['input']>;
  /** Excludes values containing the provided substring. */
  doesNotContain?: InputMaybe<Scalars['String']['input']>;
  /** Matches values exactly. */
  equals?: InputMaybe<Scalars['String']['input']>;
  /** Excludes any value from the provided list. */
  excludedFrom?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Matches any value from the provided list. */
  includedIn?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Filters values based on whether the field is null. */
  isNull?: InputMaybe<Scalars['Boolean']['input']>;
  /** Matches values using a regular expression pattern. */
  matchesRegex?: InputMaybe<Scalars['String']['input']>;
  /** Excludes values that match exactly. */
  notEquals?: InputMaybe<Scalars['String']['input']>;
};

/**
 * Filtering operations for fields containing a list of text values.
 * Checks whether the provided value exists inside the stored list.
 */
export type TextListFilterInput = {
  /** Returns records where the list contains the specified text value. */
  inList: Scalars['String']['input'];
};

export type UpdateAssetInput = {
  focalPoint?: InputMaybe<CoordinateInput>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  translations?: InputMaybe<Array<AssetTranslationInput>>;
};

export type UpdateGlobalSettingsInput = {
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRoleInput = {
  code?: InputMaybe<Scalars['String']['input']>;
  companyId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  marketplaceRegionIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  permissions?: InputMaybe<Array<Permission>>;
};

export type UpdateRoleResult = Role | RoleCodeConflictError;

export type User = Node & {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  identifier: Scalars['String']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastAuthenticatedAt?: Maybe<Scalars['DateTime']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};
