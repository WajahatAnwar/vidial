<!DOCTYPE html>
<html>
<head>
    <title>Orders Mail</title>
</head>
<body>
    <h1>{{ $details['title'] }}</h1>
    <p>{{ $details['body'] }}</p>

    <p>Need a Review</p>
    <a href="{{ route('review_updated' ,['id' => $details['id']]) }}">Update Review</a>

</body>
</html>
