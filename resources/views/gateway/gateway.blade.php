<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>Punchout Gateway</title>

    <link rel="stylesheet" href="https://procurement.clubhub.host/static/templates/flare/vendors/iconfonts/simple-line-icon/css/simple-line-icons.css">
    <link rel="stylesheet" href="https://procurement.clubhub.host/static/templates/flare/vendors/css/vendor.bundle.base.css">
    <link rel="stylesheet" href="https://procurement.clubhub.host/static/templates/flare/vendors/css/vendor.bundle.addons.css">

    <link rel="stylesheet" href="https://procurement.clubhub.host/static/templates/flare/css/style.css">

    <link rel="shortcut icon" href="https://procurement.clubhub.host/static/templates/flare/images/favicon.png" />

    <script src="https://procurement.clubhub.host/static/templates/flare/vendors/js/vendor.bundle.base.js"></script>
    <script src="https://procurement.clubhub.host/static/templates/flare/vendors/js/vendor.bundle.addons.js"></script>

    <script src="https://procurement.clubhub.host/static/templates/flare/js/template.js"></script>
</head>

<body>
    <div class="container-scroller">
        <div class="container-fluid page-body-wrapper full-page-wrapper">
            <div class="content-wrapper d-flex align-items-center auth auth-bg-1 theme-one">
                <div class="row w-100 mx-auto">
                    <div class="col-lg-4 mx-auto">
                        <div class="auto-form-wrapper">

                            <form action="{{ $url }}" method="post" id="mainform"
                                enctype="application/x-www-form-urlencoded">
                                <div class="form-group" style="min-height: 300px">
                                    <label class="label">Please wait...</label>
                                    <div class="input-group">
                                        <div class="dot-opacity-loader">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>

                                @if (isset($cxmlbase64))
                                    <input type="hidden" name="{{ $cxmlbase64_param }}" value="{{ $cxmlbase64 }}">
                                @endif

                                @if (isset($cxmlurlencoded))
                                    <input type="hidden" name="cxml-urlencoded" value="{{ $cxmlurlencoded }}">
                                @endif

                            </form>

                            @if (isset($continue) && $continue == true)
                                <script>
                                    $(function() {
                                        setTimeout(function() {
                                            $('#mainform').submit();
                                        }, 10);

                                    });
                                </script>
                            @endif

                        </div>

                        <p class="footer-text text-center">Copyright © Club Colors. All rights reserved.</p>
                    </div>
                </div>
            </div>

        </div>

    </div>

</body>

</html>
