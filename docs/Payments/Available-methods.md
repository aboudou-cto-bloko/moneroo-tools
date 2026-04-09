# Available methods

Below is a list of payment methods we support. The list is constantly growing, so check back for updates.

To learn more about a specific payment method and what payment gateway supports it, please check your [connection list section](http://moneroo.io/connection).

{% hint style="info" %}
You can get updated list of all available payment methods by calling [GET /utils/payment/methods](https://api.moneroo.io/utils/payment/methods) endpoint.

```
GET /utils/payout/methods HTTP/1.1
Host: https://api.moneroo.io
Accept: application/json
```

{% endhint %}

***

| Name                     | Code                   | Currency | Countries                                                                                                  |
| ------------------------ | ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| Airtel Congo             | airtel\_cd             | CDF      | CD                                                                                                         |
| Airtel Money Malawi      | airtel\_mw             | MWK      | MW                                                                                                         |
| Airtel Niger             | airtel\_ne             | XOF      | NE                                                                                                         |
| Airtel Money Nigeria     | airtel\_ng             | NGN      | NG                                                                                                         |
| Airtel Rwanda            | airtel\_rw             | RWF      | RW                                                                                                         |
| Airtel Tanzania          | airtel\_tz             | TZS      | TZ                                                                                                         |
| Airtel Uganda            | airtel\_ug             | UGX      | UG                                                                                                         |
| Airtel Zambia            | airtel\_zm             | ZMW      | ZM                                                                                                         |
| Bank Transfer NG         | bank\_transfer\_ng     | NGN      | NG                                                                                                         |
| Barter                   | barter                 | NGN      | NG                                                                                                         |
| Credit Card GHS          | card\_ghs              | GHS      | GH                                                                                                         |
| Card Kenya               | card\_kes              | KES      | KE                                                                                                         |
| Credit Card NGN          | card\_ngn              | NGN      | NG                                                                                                         |
| Card Tanzania            | card\_tzs              | TZS      | TZ                                                                                                         |
| Card Uganda              | card\_ugx              | UGX      | UG                                                                                                         |
| Credit Card USD          | card\_usd              | USD      | World                                                                                                      |
| Credit Card XAF          | card\_xaf              | XAF      | CM, CF, CG, GA, GQ, TD                                                                                     |
| Credit Card XOF          | card\_xof              | XOF      | CI, BF, TG, BJ, ML                                                                                         |
| Credit Card ZAR          | card\_zar              | ZAR      | ZA                                                                                                         |
| Crypto EUR               | crypto\_eur            | EUR      | AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GR, HR, HU, IE, IT, LT, LU, LV, MT, NL, PL, PT, RO, SE, SI, SK |
| Crypto GHS               | crypto\_ghs            | GHS      | GH                                                                                                         |
| Crypto NGN               | crypto\_ngn            | NGN      | NG                                                                                                         |
| Crypto USD               | crypto\_usd            | USD      | US                                                                                                         |
| Crypto XAF               | crypto\_xaf            | XAF      | CM, CF, CG, GA, GQ, TD                                                                                     |
| Crypto XOF               | crypto\_xof            | XOF      | BJ, BF, CI, GW, ML, NE, SN, TG                                                                             |
| E-Money Senegal          | e\_money\_sn           | XOF      | SN                                                                                                         |
| EU Mobile Money Cameroon | eu\_mobile\_cm         | XAF      | CM                                                                                                         |
| Free Money Senegal       | freemoney\_sn          | XOF      | SN                                                                                                         |
| Halopesa                 | halopesa\_tz           | TZS      | TZ                                                                                                         |
| Mobi Cash Mali           | mobi\_cash\_ml         | XOF      | ML                                                                                                         |
| Test Payment Method      | moneroo\_payment\_demo | USD      | US                                                                                                         |
| Moov Burkina Faso        | moov\_bf               | XOF      | BF                                                                                                         |
| Moov Money Benin         | moov\_bj               | XOF      | BJ                                                                                                         |
| Moov Money CI            | moov\_ci               | XOF      | CI                                                                                                         |
| Moov Money Mali          | moov\_ml               | XOF      | ML                                                                                                         |
| Moov Money Togo          | moov\_tg               | XOF      | TG                                                                                                         |
| M-Pesa Kenya             | mpesa\_ke              | KES      | KE                                                                                                         |
| Vodacom Tanzania         | mpesa\_tz              | TZS      | TZ                                                                                                         |
| MTN MoMo Benin           | mtn\_bj                | XOF      | BJ                                                                                                         |
| MTN MoMo CI              | mtn\_ci                | XOF      | CI                                                                                                         |
| MTN MoMo Cameroon        | mtn\_cm                | XAF      | CM                                                                                                         |
| MTN MoMo Ghana           | mtn\_gh                | GHS      | GH                                                                                                         |
| MTN MoMo Guinea          | mtn\_gn                | GNF      | GN                                                                                                         |
| MTN Nigeria              | mtn\_ng                | NGN      | NG                                                                                                         |
| MTN MoMo Rwanda          | mtn\_rw                | RWF      | RW                                                                                                         |
| MTN MoMo Uganda          | mtn\_ug                | UGX      | UG                                                                                                         |
| MTN MoMo Zambia          | mtn\_zm                | ZMW      | ZM                                                                                                         |
| Orange Burkina Faso      | orange\_bf             | XOF      | BF                                                                                                         |
| Orange Congo             | orange\_cd             | CDF      | CD                                                                                                         |
| Orange Money CI          | orange\_ci             | XOF      | CI                                                                                                         |
| Orange Money Cameroon    | orange\_cm             | XAF      | CM                                                                                                         |
| Orange Money Guinea      | orange\_gn             | GNF      | GN                                                                                                         |
| Orange Money Mali        | orange\_ml             | XOF      | ML                                                                                                         |
| Orange Money Senegal     | orange\_sn             | XOF      | SN                                                                                                         |
| QR Code Nigeria          | qr\_ngn                | NGN      | NG                                                                                                         |
| Airtel/Tigo Ghana        | tigo\_gh               | GHS      | GH                                                                                                         |
| Tigo Tanzania            | tigo\_tz               | TZS      | TZ                                                                                                         |
| TNM Mpamba Malawi        | tnm\_mw                | MWK      | MW                                                                                                         |
| Togocel Money            | togocel                | XOF      | TG                                                                                                         |
| USSD NGN                 | ussd\_ngn              | NGN      | NG                                                                                                         |
| Vodacom Congo            | vodacom\_cd            | CDF      | CD                                                                                                         |
| Vodafone Ghana           | vodafone\_gh           | GHS      | GH                                                                                                         |
| Wave CI                  | wave\_ci               | XOF      | CI                                                                                                         |
| Wave Senegal             | wave\_sn               | XOF      | SN                                                                                                         |
| Wizall Senegal           | wizall\_sn             | XOF      | SN                                                                                                         |
| Zamtel Kwacha            | zamtel\_zm             | ZMW      | ZM                                                                                                         |
| Mobi Cash Mali           | mobi\_cash\_ml         | XOF      | ML                                                                                                         |
| Test Payment Method      | moneroo\_payment\_demo | USD      | US                                                                                                         |
| Moov Burkina Faso        | moov\_bf               | XOF      | BF                                                                                                         |
| Moov Money Benin         | moov\_bj               | XOF      | BJ                                                                                                         |
| Moov Money CI            | moov\_ci               | XOF      | CI                                                                                                         |
| Moov Money Mali          | moov\_ml               | XOF      | ML                                                                                                         |
| Moov Money Togo          | moov\_tg               | XOF      | TG                                                                                                         |
| M-Pesa Kenya             | mpesa\_ke              | KES      | KE                                                                                                         |
| Vodacom Tanzania         | mpesa\_tz              | TZS      | TZ                                                                                                         |
| MTN MoMo Benin           | mtn\_bj                | XOF      | BJ                                                                                                         |
| MTN MoMo CI              | mtn\_ci                | XOF      | CI                                                                                                         |
| MTN MoMo Cameroon        | mtn\_cm                | XAF      | CM                                                                                                         |
| MTN MoMo Ghana           | mtn\_gh                | GHS      | GH                                                                                                         |
| MTN MoMo Guinea          | mtn\_gn                | GNF      | GN                                                                                                         |
| MTN Nigeria              | mtn\_ng                | NGN      | NG                                                                                                         |
| MTN MoMo Rwanda          | mtn\_rw                | RWF      | RW                                                                                                         |
| MTN MoMo Uganda          | mtn\_ug                | UGX      | UG                                                                                                         |
| MTN MoMo Zambia          | mtn\_zm                | ZMW      | ZM                                                                                                         |
| Orange Burkina Faso      | orange\_bf             | XOF      | BF                                                                                                         |
| Orange Congo             | orange\_cd             | CDF      | CD                                                                                                         |
| Orange Money CI          | orange\_ci             | XOF      | CI                                                                                                         |
| Orange Money Cameroon    | orange\_cm             | XAF      | CM                                                                                                         |
| Orange Money Guinea      | orange\_gn             | GNF      | GN                                                                                                         |
| Orange Money Mali        | orange\_ml             | XOF      | ML                                                                                                         |
| Orange Money Senegal     | orange\_sn             | XOF      | SN                                                                                                         |
| QR Code Nigeria          | qr\_ngn                | NGN      | NG                                                                                                         |
| Airtel/Tigo Ghana        | tigo\_gh               | GHS      | GH                                                                                                         |
| Tigo Tanzania            | tigo\_tz               | TZS      | TZ                                                                                                         |
| TNM Mpamba Malawi        | tnm\_mw                | MWK      | MW                                                                                                         |
| Togocel Money            | togocel                | XOF      | TG                                                                                                         |
| USSD NGN                 | ussd\_ngn              | NGN      | NG                                                                                                         |
| Vodacom Congo            | vodacom\_cd            | CDF      | CD                                                                                                         |
| Vodafone Ghana           | vodafone\_gh           | GHS      | GH                                                                                                         |
| Wave CI                  | wave\_ci               | XOF      | CI                                                                                                         |
| Wave Senegal             | wave\_sn               | XOF      | SN                                                                                                         |
| Wizall Senegal           | wizall\_sn             | XOF      | SN                                                                                                         |
| Zamtel Kwacha            | zamtel\_zm             | ZMW      | ZM                                                                                                         |

We are constantly adding new payment methods. If you don't see your preferred payment method, please [contact us](https://moneroo.io/contact).
