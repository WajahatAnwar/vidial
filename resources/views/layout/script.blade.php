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
    multiple: false,
    allowedFileExtensions: ['.jpg', '.jpeg', '.gif', '.png'],
    uploadMode: 'instantly',
    uploadUrl: '/url',
    visible: false,
    onDropZoneEnter(e) {
      if (e.dropZoneElement.id === 'dropzone-external') { toggleDropZoneActive(e.dropZoneElement, true); }
    },
    onDropZoneLeave(e) {
      if (e.dropZoneElement.id === 'dropzone-external') { toggleDropZoneActive(e.dropZoneElement, false); }
    },
    onUploaded(e) {
      const { file } = e;
      const dropZoneText = document.getElementById('dropzone-text');
      const fileReader = new FileReader();
      fileReader.onload = function () {
        toggleDropZoneActive(document.getElementById('dropzone-external'), false);
        const dropZoneImage = document.getElementById('dropzone-image');
        dropZoneImage.src = fileReader.result;
      };
      fileReader.readAsDataURL(file);
      dropZoneText.style.display = 'none';
      uploadProgressBar.option({
        visible: false,
        value: 0,
      });
    },
    onProgress(e) {
      uploadProgressBar.option('value', (e.bytesLoaded / e.bytesTotal) * 100);
    },
    onUploadStarted() {
      toggleImageVisible(false);
      uploadProgressBar.option('visible', true);
    },
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
                        console.log(response);
						//alert(response);
					},
					error: function(jqXHR, textStatus, errorThrown) {
						//alert("Error: " + textStatus + " - " + errorThrown);
					}
				});
			});
		});
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>

