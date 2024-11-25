<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Fraud Order Mail</title>
    </head>
    <body>
        <table width="600" border="0">
            <tbody>
                <tr>
                    <td>
                        <table width="600" border="0">
                            <tbody>
                                <tr style="text-align: center; width: 100%">
                                    <td colspan="4" style="text-align: left; width: 100%">
                                        <img src="https://tscstatic.clubcolors.com/logo/logo_Z0WUONL9NY.png"
                                            style="width: 110px;text-align: left; display: block;" />
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="4">
                                        <h3
                                            style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; font-size: 28px;">
                                            {{ $data['subject'] }}</h3>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="4">
                                        <br>
                                        <b
                                            style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; font-size: 14px">
                                            Order No: {{ $data['order_name'] }}</b>
                                    </td>
                                </tr>
                                <tr>
                                    <td colspan="4">
                                        <p
                                            style="font-family: Gotham, 'Helvetica Neue', Helvetica, Arial, 'sans-serif'; line-height: 1.5em; font-size: 18px; white-space: pre-line;">
                                            {{ $data['body'] }}</p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
</html>
