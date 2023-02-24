<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script>
window.jQuery || document.write(decodeURIComponent('%3Cscript src="js/jquery.min.js"%3E%3C/script%3E'))
</script>
<script src="https://cdn3.devexpress.com/jslib/22.2.3/js/dx.all.js"></script>
<script>

/******** DropZone Library *********/
      $(() => {
$('#file-uploader').dxFileUploader({
  dialogTrigger: '#dropzone-external',
    dropZone: '#dropzone-external',
    name: "video",
    multiple: false,
    accept: "video/*",
    uploadMode: "instantly",
    uploadUrl: "{{ url('/test-Up') }}",
    onUploaded: function(e) {
      var videoUrl = e.request.response;
      var email = $("#exampleFormControlInput1").val();
        console.log(videoUrl)
      // Validate email using regular expression
      if (!validateEmail(email)) {
      
        alert("Invalid email address");
        return;
      }
      
      // Send email and video using jQuery AJAX
      $.ajax({
        type: "POST",
        url: "{{url('send-test-Up')}}",
        data: {
          email: email,
          videoUrl: videoUrl
        },
        success: function(response) {
          alert("Email sent successfully");
        },
        error: function(xhr, textStatus, errorThrown) {
          alert("Failed to send email: " + errorThrown);
        }
      });
    }
  });
  // Email validation function using regular expression
  function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
  //Submit form on button click
  $("#upload-form").click(function(e) {
    e.preventDefault();
    $("#file-uploader").dxFileUploader("upload");
  });

  const uploadProgressBar = $('#upload-progress').dxProgressBar({
    min: 0,
    max: 100,
    width: '30%',
    showStatus: false,
    visible: false,
  }).dxProgressBar('instance');

  function toggleDropZoneActive(dropZone, isActive) {
    if (isActive) {
      dropZone.classList.add('dx-theme-accent-as-border-color');
      dropZone.classList.remove('dx-theme-border-color');
      dropZone.classList.add('dropzone-active');
    } else {
      dropZone.classList.remove('dx-theme-accent-as-border-color');
      dropZone.classList.add('dx-theme-border-color');
      dropZone.classList.remove('dropzone-active');
    }
  }

  function toggleImageVisible(visible) {
    const dropZoneImage = document.getElementById('dropzone-image');
    dropZoneImage.hidden = !visible;
  }

  document.getElementById('dropzone-image').onload = function () { toggleImageVisible(true); };
});

/****** redirect to upload video page ******/
const redirect = ()=>{
    window.location.href = "{{ url('/uploadVideo') }}";
}
    	$(document).ready(function() {
			$("#upload-form").submit(function(event) {
				event.preventDefault();
               var form = new FormData(); 
form.append("video", $("#fileinput")[0].files[0]);
               


				$.ajax({
					url: "{{ url('/testUploaded') }}",
					type: "POST",
					data: form,
					processData: false,
					contentType: false,
					success: function(response) {
                        if(response.success){
                         console.log(response.message);
                        }
                       
						//alert(response);
					},
					error: function(response) {
                        var errors = response.responseJSON.errors;
            $.each(errors, function(key, value) {
                console.log(key,value)
                // Display error message
            });
						//alert("Error: " + textStatus + " - " + errorThrown);
					}
				});
			});
		});
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>

