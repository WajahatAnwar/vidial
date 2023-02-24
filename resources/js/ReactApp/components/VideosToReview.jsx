import {Page, Grid, Card, Text, Button, Banner, ProgressBar, Icon, TextField, Popover, DatePicker} from '@shopify/polaris';
import {useEffect, useState,useCallback} from 'react';
import React from 'react';
import { useNavigate, useParams,Link } from 'react-router-dom';
import EmailLogo from "./imges/emailLogo.png";
import WaitingLogo from "./imges/WaitingLogo.png";
import  ApprovedLogo from "./imges/ApprovedLogo.png"
import WaitingIcon from "./imges/waiting2.png";
import VideoTumbnail from "./imges/bureau 11.png";
import { CircleCancelMajor, CircleTickMajor } from '@shopify/polaris-icons';
import downloadIcon from "./imges/downloadIcon.png";

function WaitingVideos() {

 /******** Fetching Videos  ******/
 const [videos,setVideos] = useState([]);
 useEffect(()=>{
    fetch('/getPendingVideos')
  .then(response => {
    if (!response.ok) {
      throw new Error('Something went wrong');
    }
    return response.json();
  })
  .then(data => {
      if(data.success){
        setVideos(data.data);
      }
    
  })
  .catch(error => {
      console.log(error);
  });

 },[])
  /******** Operation on Videos  ******/
 const videoOperation = (id,type)=>{
   
    const confirmed = confirm('Are you sure you want to Approved?');
    var formData = new FormData();
    formData.append('video_id',id);
    formData.append('type',type);
    if (confirmed) {
        fetch('/videoOperation',{
            method:"post",
            body:formData
        })
  .then(response => {
    if (!response.ok) {
      throw new Error('Something went wrong');
    }
    return response.json();
  })
  .then(data => {
      if(data.success){
        console.log(data.message);
      }
    
  })
  .catch(error => {
      console.log(error);
  });
    }
 }
    return (
        <Page >
            <Grid>
            <Grid.Cell columnSpan={{xs: 6, sm: 6, md: 6, lg: 12, xl: 12}}>
                        <Card>
                            <Card.Section >
                                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"-10px",marginBottom:"-10px"}}>
                                    <div style={{display:"flex",alignItems:"center"}}>
                                        <img src={WaitingIcon} width="20px" height="20px" style={{marginRight:"10px"}}></img>
                                        <Text variant="headingLg" as="h5">
                                            Waiting Videos
                                        </Text>
                                    </div>
                                </div>
                            </Card.Section>
                            <Card.Section>
                                <Grid>
                               {videos && videos.map((video) => {
                          
                          return (
                                    <Grid.Cell columnSpan={{xs: 3, sm: 3, md: 3, lg: 3, xl: 3}}>
                                        <div style={{textAlign:"center"}}>
                                            {/* <img src={VideoTumbnail} width= "100%"></img> */}
                                            <video width="320" height="240" controls>
    <source src={video.video_link} type="video/mp4"/>
  Your browser does not support the video tag.
   </video>
   
                                            <p style={{fontSize:"12px",color:"#797979",marginTop:"10px"}}>{video.email}</p>
                                            <p style={{fontSize:"12px",color:"#797979"}}>{video.created_at}</p>
                                                <div style={{border:"1px solid #dddd",padding:"6px 12px",borderRadius:"9px",width:"86px",margin:"auto",marginTop:"10px"}}>
                                                <div style={{display:"flex"}}>
                                                    
                                                    <div style={{marginRight:"20px"}} onClick={()=>{videoOperation(video.id,1)}}>
                                                    <Link to="#" >

                                                    <Icon 
                                                        source={CircleTickMajor}
                                                        color="primary"
                                                        />
                                                        </Link>
                                                    </div>
                                                <div>
                                                <Link to="#" onClick={()=>{videoOperation(video.id,0)}}>
                                                <Icon
                                                    source={CircleCancelMajor}
                                                    color="critical"
                                                    />
                                                    </Link>
                                                    </div>
                                                </div>
                                                </div>
                                            </div>
                                    </Grid.Cell>
                                    )
                                     })
                                     }
                                   
                                  
                                   
                                    
                                 
                                    
                                </Grid>
                            </Card.Section>
                        </Card>
                    </Grid.Cell>
                    </Grid>
        </Page>
    );


}

export default WaitingVideos;
