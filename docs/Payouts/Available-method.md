# Available methods

Below is a list of payout methods we support. The list is constantly growing, so check back for updates.

To learn more about a specific payout method and what payout gateway supports it, please check your [connection list section](http://moneroo.io/connection).

{% hint style="info" %}
You can get updated list of all available payout methods by calling [GET /utils/payout/methods](https://api.moneroo.io/utils/payout/methods) endpoint.

{% code overflow="wrap" fullWidth="false" %}

```bash
GET /utils/payout/methods HTTP/1.1
Host: https://api.moneroo.io
Accept: application/json
```

{% endcode %}
{% endhint %}

***

### Payout methods

| Name                     | Code                  | Currency | Countries |
| ------------------------ | --------------------- | -------- | --------- |
| Airtel Congo             | `airtel_cd`           | CDF      | CD        |
| Airtel Money Malawi      | `airtel_mw`           | MWK      | MW        |
| Airtel Money Nigeria     | `airtel_ng`           | NGN      | NG        |
| Airtel Rwanda            | `airtel_rw`           | RWF      | RW        |
| Airtel Tanzania          | `airtel_tz`           | TZS      | TZ        |
| Airtel Uganda            | `airtel_ug`           | UGX      | UG        |
| Airtel Zambia            | `airtel_zm`           | ZMW      | ZM        |
| Djamo CI                 | `djamo_ci`            | XOF      | CI        |
| Djamo SN                 | `djamo_sn`            | XOF      | SN        |
| E-Money Senegal          | `e_money_sn`          | XOF      | SN        |
| EU Mobile Money Cameroon | `eu_mobile_cm`        | XAF      | CM        |
| Free Money Senegal       | `freemoney_sn`        | XOF      | SN        |
| Halopesa                 | `halopesa_tz`         | TZS      | TZ        |
| Test Payout Method       | `moneroo_payout_demo` | USD      | US        |
| Moov Money Benin         | `moov_bj`             | XOF      | BJ        |
| Moov Money CI            | `moov_ci`             | XOF      | CI        |
| Moov Money Togo          | `moov_tg`             | XOF      | TG        |
| M-Pesa Kenya             | `mpesa_ke`            | KES      | KE        |
| Vodacom Tanzania         | `mpesa_tz`            | TZS      | TZ        |
| MTN MoMo Benin           | `mtn_bj`              | XOF      | BJ        |
| MTN MoMo CI              | `mtn_ci`              | XOF      | CI        |
| MTN MoMo Cameroon        | `mtn_cm`              | XAF      | CM        |
| MTN MoMo Ghana           | `mtn_gh`              | GHS      | GH        |
| MTN Nigeria              | `mtn_ng`              | NGN      | NG        |
| MTN MoMo Rwanda          | `mtn_rw`              | RWF      | RW        |
| MTN MoMo Uganda          | `mtn_ug`              | UGX      | UG        |
| MTN MoMo Zambia          | `mtn_zm`              | ZMW      | ZM        |
| Orange Congo             | `orange_cd`           | CDF      | CD        |
| Orange Money CI          | `orange_ci`           | XOF      | CI        |
| Orange Money Cameroon    | `orange_cm`           | XAF      | CM        |
| Orange Money Mali        | `orange_ml`           | XOF      | ML        |
| Orange Money Senegal     | `orange_sn`           | XOF      | SN        |
| Airtel/Tigo Ghana        | `tigo_gh`             | GHS      | GH        |
| Tigo Tanzania            | `tigo_tz`             | TZS      | TZ        |
| TNM Mpamba Malawi        | `tnm_mw`              | MWK      | MW        |
| Togocel Money            | `togocel`             | XOF      | TG        |
| Vodacom Congo            | `vodacom_cd`          | CDF      | CD        |
| Vodafone Ghana           | `vodafone_gh`         | GHS      | GH        |
| Wave CI                  | `wave_ci`             | XOF      | CI        |
| Wave Senegal             | `wave_sn`             | XOF      | SN        |
| Zamtel Kwacha            | `zamtel_zm`           | ZMW      | ZM        |

We are constantly adding new payout methods. If you don't see the payout method you need, please [contact us](https://moneroo.io/contact).

### Required fields

Each payout method has its own set of required fields, y**ou should provide them in the request body when creating a payout**.

<table><thead><tr><th>Code</th><th align="center">Fields</th><th align="center">Type</th><th width="157">Example</th><th>Description</th></tr></thead><tbody><tr><td>airtel_cd</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>243XXXXXXXXX</td><td>Airtel Congo account phone number that will receive money in international format.</td></tr><tr><td>airtel_mw</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>265XXXXXXXXX</td><td>Airtel Money Malawi account phone number that will receive money in international format.</td></tr><tr><td>airtel_ng</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>234XXXXXXXXX</td><td>Airtel Money Nigeria account phone number that will receive money in international format.</td></tr><tr><td>airtel_rw</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>250XXXXXXXXX</td><td>Airtel Rwanda account phone number that will receive money in international format.</td></tr><tr><td>airtel_tz</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>255XXXXXXXXX</td><td>Airtel Tanzania account phone number that will receive money in international format.</td></tr><tr><td>airtel_ug</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>256XXXXXXXXX</td><td>Airtel Uganda account phone number that will receive money in international format.</td></tr><tr><td>airtel_zm</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>260XXXXXXXXX</td><td>Airtel Zambia account phone number that will receive money in international format.</td></tr><tr><td>djamo_ci</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>225XXXXXXXXX</td><td>Djamo CI account phone number that will receive money in international format.</td></tr><tr><td>djamo_sn</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>221XXXXXXXXX</td><td>Djamo SN account phone number that will receive money in international format.</td></tr><tr><td>e_money_sn</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>221XXXXXXXXX</td><td>E-Money Senegal account phone number that will receive money in international format.</td></tr><tr><td>eu_mobile_cm</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>237XXXXXXXXX</td><td>EU Mobile Money Cameroon account phone number that will receive money in international format.</td></tr><tr><td>freemoney_sn</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>221XXXXXXXXX</td><td>Free Money Senegal account phone number that will receive money in international format.</td></tr><tr><td>halopesa_tz</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>255XXXXXXXXX</td><td>Halopesa account phone number that will receive money in international format.</td></tr><tr><td>moneroo_payout_demo</td><td align="center"><code>account_number</code></td><td align="center"><code>integer</code></td><td>1XXXXXXXXX</td><td>Test Payout account phone number that will receive money in international format.</td></tr><tr><td>moov_bj</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>229XXXXXXXXX</td><td>Moov Money Benin account phone number that will receive money in international format.</td></tr><tr><td>moov_ci</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>225XXXXXXXXX</td><td>Moov Money CI account phone number that will receive money in international format.</td></tr><tr><td>moov_tg</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>228XXXXXXXXX</td><td>Moov Money Togo account phone number that will receive money in international format.</td></tr><tr><td>mpesa_ke</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>254XXXXXXXXX</td><td>M-Pesa Kenya account phone number that will receive money in international format.</td></tr><tr><td>mpesa_tz</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>255XXXXXXXXX</td><td>Vodacom Tanzania account phone number that will receive money in international format.</td></tr><tr><td>mtn_bj</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>229XXXXXXXXX</td><td>MTN MoMo Benin account phone number that will receive money in international format.</td></tr><tr><td>mtn_ci</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>225XXXXXXXXX</td><td>MTN MoMo CI account phone number that will receive money in international format.</td></tr><tr><td>mtn_cm</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>237XXXXXXXXX</td><td>MTN MoMo Cameroon account phone number that will receive money in international format.</td></tr><tr><td>mtn_gh</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>233XXXXXXXXX</td><td>MTN MoMo Ghana account phone number that will receive money in international format.</td></tr><tr><td>mtn_ng</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>234XXXXXXXXX</td><td>MTN Nigeria account phone number that will receive money in international format.</td></tr><tr><td>mtn_rw</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>250XXXXXXXXX</td><td>MTN MoMo Rwanda account phone number that will receive money in international format.</td></tr><tr><td>mtn_ug</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>256XXXXXXXXX</td><td>MTN MoMo Uganda account phone number that will receive money in international format.</td></tr><tr><td>mtn_zm</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>260XXXXXXXXX</td><td>MTN MoMo Zambia account phone number that will receive money in international format.</td></tr><tr><td>orange_cd</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>243XXXXXXXXX</td><td>Orange Congo account phone number that will receive money in international format.</td></tr><tr><td>orange_ci</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>225XXXXXXXXX</td><td>Orange Money CI account phone number that will receive money in international format.</td></tr><tr><td>orange_cm</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>237XXXXXXXXX</td><td>Orange Money Cameroon account phone number that will receive money in international format.</td></tr><tr><td>orange_ml</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>223XXXXXXXXX</td><td>Orange Money Mali account phone number that will receive money in international format.</td></tr><tr><td>orange_sn</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>221XXXXXXXXX</td><td>Orange Money Senegal account phone number that will receive money in international format.</td></tr><tr><td>tigo_gh</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>233XXXXXXXXX</td><td>Airtel/Tigo Ghana account phone number that will receive money in international format.</td></tr><tr><td>tigo_tz</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>255XXXXXXXXX</td><td>Tigo Tanzania account phone number that will receive money in international format.</td></tr><tr><td>tnm_mw</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>265XXXXXXXXX</td><td>TNM Mpamba Malawi account phone number that will receive money in international format.</td></tr><tr><td>togocel</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>228XXXXXXXXX</td><td>Togocel Money account phone number that will receive money in international format.</td></tr><tr><td>vodacom_cd</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>243XXXXXXXXX</td><td>Vodacom Congo account phone number that will receive money in international format.</td></tr><tr><td>vodafone_gh</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>233XXXXXXXXX</td><td>Vodafone Ghana account phone number that will receive money in international format.</td></tr><tr><td>wave_ci</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>225XXXXXXXXX</td><td>Wave CI account phone number that will receive money in international format.</td></tr><tr><td>wave_sn</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>221XXXXXXXXX</td><td>Wave Senegal account phone number that will receive money in international format.</td></tr><tr><td>zamtel_zm</td><td align="center"><code>msisdn</code></td><td align="center"><code>integer</code></td><td>260XXXXXXXXX</td><td>Zamtel Kwacha account phone number that will receive money in international format.</td></tr></tbody></table>
