

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script>
window.jQuery || document.write(decodeURIComponent('%3Cscript src="js/jquery.min.js"%3E%3C/script%3E'))
</script>
<script src="https://cdn3.devexpress.com/jslib/22.2.3/js/dx.all.js"></script>
<script>




/******** DropZone Library *********/
$(() => {
  const fileUploader =$('#file-uploader').dxFileUploader({
    dialogTrigger: '#dropzone-external',
    dropZone: '#dropzone-external',
    multiple: false,
    allowedFileExtensions: ['.mp4', '.MOV', '.mkv', '.avi', '.m4v'],
    uploadMode: 'instantly',
    uploadUrl: '{{ url("/uploadVideo") }}',
    visible: false,
    onUploadStarted: function(e) {
        $('.loading_details').removeAttr("style");
    },
    onUploaded: function(e) {
        document.getElementById("uploaded-file-name").innerHTML = "Uploaded file name: " + e.file.name;
        var response = JSON.parse(e.request.responseText);
        if (response.success) {
            localStorage.setItem('video_url', response.data);
        }
        $('.loading_details').hide();
    },
  });
  document.getElementById('dropzone-image').onload = function () { toggleImageVisible(true); };

});
const saveVideo = ()=>{
    var video_link =localStorage.getItem('video_url');

    var email = $('#email').val();
    var terms_conditions = $('#terms_condition').is(":checked") ? 1 : 0;
    // geting Store name
    const url = new URL(window.location.toLocaleString());
    const store = url.searchParams.get('store');
    const order_id = url.searchParams.get('order_id');
    if(video_link=='' || video_link==null){
        $('#error-video').removeClass('d-none').text('Please upload a video');
        return false;
    }else if(email==''){
        $('#error-email').removeClass('d-none').text('Please Fill Email Field');
        return false;

    }else if(!terms_conditions){
        console.log(terms_conditions);
        $('#error-terms-conditions').removeClass('d-none').text('Please Accept terms and conditions');

        return false;
    }
    else if(store==''){
        console.log('Something went wrong');
        return false;
    }
    var data = {"video_link":video_link, "email":email,"store":store,"order_id":order_id}
    $.ajax({
        url:"{{ url('/saveVideo') }}",
        method:"post",
        data:data,
        dataType:"json",
        success:function(response){
            if(response.success){
                // $("#success_popup").modal('show');
                //localStorage.removeItem('video_url');
                 $('#email').val('');
                 var congrats ="{{url('congratulations')}}";
                 congrats = congrats + '?store=' + store
                    //window.location.href = 'https://'+store;
                    window.location.href = congrats;
                    
                
            }
        }
    })
}


/****** redirect to upload video page ******/
$('#redirect').click(function(){
    var store =$(this).attr('store');
    var locale =$(this).attr('locale');
    if(store=='' || locale == ''){
        alert('something went wrong');
        return false;
    }

    var baseUrl = "{{ url('/uploadVideo') }}"
    baseUrl = baseUrl + '/'+locale+'?'+'store='+store;
    window.location.href = baseUrl;
})
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

