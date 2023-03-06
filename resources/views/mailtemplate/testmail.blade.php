@extends('layout.layout')
@section('content')
    <div class="row justify-content-center " style="margin-top: 40px ">
        <div class="col-md-3 p-3">
            @include('landingPage.logo',['current_user_id'=>$details['user_id']])
            <h3 class="text-center mt-4 mb-3" style="font-size: 30px;font-weight: 600;">{{ __('landingPage.heading',['storename'=>'test','store_credit'=>$details['store_credit']]) }}</h3>
            <p  class="text-center mb-2" style="color: #FF5175;font-size: 20px;font-weight: 500;">{{$details['instruction_title']}}</p>
            <div style="padding-left:20px ;">

                @php
                $Lists=(json_decode($details['instructions'],true));

                @endphp
                @foreach ($Lists as $list)
                <div style="display: flex;align-items: center;margin-bottom: 15px;">
                    <div style="background: #E5E7EB;padding: 8px 16px;border-radius: 50%;margin-right: 15px;color: #6B7280;">{{$loop->index + 1}}</div>
                    <p style="margin-bottom: 0;font-weight: 600;">{{$list['value']}}</p>
                </div>
                @endforeach

            </div>
            <a type="button"   href="{{ route('uploadVideo' ,['locale' =>$details['locale'] ]).'?store='.$details['store']}}"   class="btn btn-primary" id="redirect" store="test" locale= "{{ $details['locale'] }}"   value="" style="display:block!important ; width: 100% !important ;font-size: 20px;font-weight: 700;background: {{$details['page_color']}};height: 60px !important;border: none;    text-align: center;line-height: 52px;text-decoration: none;">
                {{-- <svg xmlns="http://www.w3.org/2000/svg" width="30" height="20" fill="currentColor" class="bi bi-camera-video-fill" viewBox="0 0 16 16">
                     <path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"></path>
                </svg> --}}
                {{__('landingPage.button_text')}}
            </a>

            @if($details['video']=='undefined' || $details['video']=='')
            @else
            <h5 class="text-center mb-3 mt-4">{{__('landingPage.footer_instruction_text')}}</h5>
                {{-- <p>{{ $details['video'] }}</p> --}}
                <video width="320" height="176" controls poster="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwcNDQcHBwcHBwcHBw0HBwcHBw8IDQcNFREWIhURExUYHSssGBoxJxUVITEtMTU3MS4uFx8zRDM4Nyg5OisBCgoKDQ0NGg0NDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAKsBJgMBIgACEQEDEQH/xAAaAAEBAQEAAwAAAAAAAAAAAAAAAQYEAwUH/8QAKhABAAEDAQUHBQAAAAAAAAAAAAECAwQRBSEiQbEGEjI0UXOBE0NhcXL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A+pqigKigAoAKACgAoIoAAoIKAgoCCgIACCgIigIigIigIigIigICgAAoAKACgoAKACgigAKAigCKAIKAgqAgoCIqAIqAIqAIqAgqAigACgKigKigKACgAoAKAAoAAAACCgIACCoCCoCCoCAAiKAiKAgACooCgCgAoKAqKAqKAqKACgAAAAIoCIoCAAiKAiKgCKgCKgIACAAKigoAKqKAqKAqKCgAoAKACg4ru08a3eqxb8zamKaaqbs+GdY5+gO0ImJ0mJiYmNYmJ1iQBFQBFQBFQEABAARFQBFQBFQEABRFBQAVUUBUUBUUFABQAVYQBWV7Q+Zue3R0aple0Pmbnt0dAeDB2jlWN1qvvWtd9mvfTP69GjwNq41/SiJ+lfn7Nc+L+Z5vR4Gx8m7pXcicezO/v1xxVx+IaHDwcaxGlm3xTGlV2riqq+QdKKgEoqAIqAIAIACAgCKgCKgIACiKCgAoAKqKBCooKIoKIoKIoK55wsabs5VduK70xERNfFFGkcoecBQQFQAEAEABAAQEARUARUAQAQABUUFEUFgRQUAFVAFVAFVAFABRAFEAVAAEAAQBFQBFQBAAQAQAEAAABVQBVQBVRQFRQURQFQBQAUQBRAFQABAAEABAAQAEABAEVAAABFBRFBRFBRFBRFBRFAVAFAAVAFEAAABAAABAAQAEABABAARUUEVAFVAFABQAURQURQFQBRFAAAAAAAEAAAEABAARUARUARUAAB//2Q==" src="{{ url('video/'.$details['video']) }}" >
                    <!-- fallback 1 -->
                    <a href="{{ url('video/'.$details['video']) }}" ><img height="176"  src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwcNDQcHBwcHBwcHBw0HBwcHBw8IDQcNFREWIhURExUYHSssGBoxJxUVITEtMTU3MS4uFx8zRDM4Nyg5OisBCgoKDQ0NGg0NDisZExkrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrKysrK//AABEIAKsBJgMBIgACEQEDEQH/xAAaAAEBAQEAAwAAAAAAAAAAAAAAAQYEAwUH/8QAKhABAAEDAQUHBQAAAAAAAAAAAAECAwQRBSEiQbEGEjI0UXOBE0NhcXL/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8A+pqigKigAoAKACgAoIoAAoIKAgoCCgIACCgIigIigIigIigIigICgAAoAKACgoAKACgigAKAigCKAIKAgqAgoCIqAIqAIqAIqAgqAigACgKigKigKACgAoAKAAoAAAACCgIACCoCCoCCoCAAiKAiKAgACooCgCgAoKAqKAqKAqKACgAAAAIoCIoCAAiKAiKgCKgCKgIACAAKigoAKqKAqKAqKCgAoAKACg4ru08a3eqxb8zamKaaqbs+GdY5+gO0ImJ0mJiYmNYmJ1iQBFQBFQBFQEABAARFQBFQBFQEABRFBQAVUUBUUBUUFABQAVYQBWV7Q+Zue3R0aple0Pmbnt0dAeDB2jlWN1qvvWtd9mvfTP69GjwNq41/SiJ+lfn7Nc+L+Z5vR4Gx8m7pXcicezO/v1xxVx+IaHDwcaxGlm3xTGlV2riqq+QdKKgEoqAIqAIAIACAgCKgCKgIACiKCgAoAKqKBCooKIoKIoKIoK55wsabs5VduK70xERNfFFGkcoecBQQFQAEAEABAAQEARUARUAQAQABUUFEUFgRQUAFVAFVAFVAFABRAFEAVAAEAAQBFQBFQBAAQAQAEAAABVQBVQBVRQFRQURQFQBQAUQBRAFQABAAEABAAQAEABAEVAAABFBRFBRFBRFBRFBRFAVAFAAVAFEAAABAAABAAQAEABABAARUUEVAFVAFABQAURQURQFQBRFAAAAAAAEAAAEABAARUARUARUAAB//2Q==" width="320" /></a>
            </video>
            @endif
             @include('landingPage.footer')
        </div>
    </div>
    <script>
        function redirectVidepPage(url){

           window.location.href = ur
        }
    </script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js" integrity="sha384-w76AqPfDkMBDXo30jS1Sgez6pr3x5MlQ1ZAGC+nuZB+EYdgRZgiwxhTBTkF7CXvN" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.3/jquery.min.js" integrity="sha512-STof4xm1wgkfm7heWqFJVn58Hm3EtS31XFaagaa8VMReCXAkQnJZ+jEy8PCC/iT18dFy95WcExNHFTqLyp72eQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  @endsection
