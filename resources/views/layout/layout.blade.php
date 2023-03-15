<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Vidial</title>
    <link rel="icon" type="image/x-icon" href="/images/Favicon.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous">
  </head>
  <style>
    @font-face {
  font-family: 'EuclidCircular';
  src: url("/fonts/Euclid Circular A Regular.woff") format("woff");

}
    .dx-fileuploader-input-wrapper {
    display: none;
}
.dx-fileuploader-file-info {
    display: none;
}
     #dropzone-external {
    width: 100%;
    height: 150px;
    background-color: #FFDEE5;
    padding: 10px;
    border: 2px dashed #FFAABC;
    border-radius: 14px;
}

#dropzone-external > * {
  pointer-events: none;
}

#dropzone-external.dropzone-active {
  border-style: solid;
}

.widget-container > span {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 16px;
}

#dropzone-image {
  max-width: 100%;
  max-height: 100%;
}

#dropzone-text > span {
  font-weight: 100;
  opacity: 0.5;
}

#upload-progress {
  display: flex;
  margin-top: 10px;
}

.flex-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.dx-fileuploader-input-wrapper {
    /* display: none; */
}
.dx-fileuploader-file {
    /* display: none; */
}
.emialInput{
    border: 2px solid #6F6E6E;
    height: 53px;
    border-radius: 15px;
    padding: 0.375rem 1.75rem;

}
.form-check-input:checked {
    background-color: #FF5175;
    border-color: #FF5175;
}
.stepsWrapper{
    max-width: 341px;
    margin-bottom: 40px !important;
    margin-top: 20px !important;
}
@media only screen and (max-width: 720px) {
    .adjustHeaddingSize{
     font-size: 22px !important;

}
.stepsWrapper{
    max-width: 300px;
}
}

body{
    font-family: 'EuclidCircular';
}
div#error-video , #error-email {
    border: none;
    background: transparent;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    /* padding-top: 0; */
}
  </style>
  <body>

  @yield('content')
  @include('layout.script')


</body>

</html>
