$(document).ready(function () {

    $(window).on("load",function(){
        $(".loader-wrapper").fadeOut("slow");
    });

    $('#feedback').prop('disabled', true);

    $(function () {
        $("#searchBox").autocomplete({
            source: function (request, response) {
                $.ajax({
                    type: "POST",
                    url: "http://localhost:5000/search",
                    dataType: "json",
                    cache: false,
                    data: {
                        q: request.term
                    },
                    success: function (data) {
                        //alert(data);
                        // console.log(data);
                        response(data);
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        console.log(textStatus + " " + errorThrown);
                    }
                });
            },
            select: function (event, ui) {
                const ulList = $('#selectedMovies');
                const spanElement = $('<span/>').attr("id", `close-${ui.item.value}`).addClass("close").text('\u00D7').click({
                    id:`${ui.item.value}`,ulList:ulList
                },removeElement)

                const li = $('<li/>').text(`${ui.item.value}`).attr('id',`${ui.item.value}`).append(spanElement).appendTo(ulList);
                $('#searchBox').val("");
                return false;
            },
            minLength: 2
        });
    });

    $("#predict").click( function(){
        const movie_list = []

        $('#selectedMovies li').each( function () {
            movie_list.push($(this).text());
        });

        const movies = {"movie_list": movie_list};

        $('#loader').show()
        
        $.ajax({
            type: "POST",
            url: "/predict",
            dataType: "json",
            contentType: "application/json;charset=UTF-8",
            traditional: "true",
            cache: false,
            data: JSON.stringify(movies),
            success: function (response) {
                const ulList = $('#predictedMovies');
                let x = 0;
                response['recommendations'].forEach(element => {
                    const diventry = $('<div/>').attr('id', 'div-entry');
                    const divStars = $('<div/>').addClass('stars')

                    // Comment input Element for comment
                    const inputElement = $('<input>', {
                        type: 'text',      // Input type
                        id: element.title,     // Input ID
                        name: element,   // Input name
                        value:'',
                        placeholder: 'Comment',
                    }).css({
                        'border':'1px solid black',
                        'border-left':'none',
                        'border-right':'none',
                        'border-top':'none',
                        'background':'none',
                        'outline':'none',
                    });

                    // Star Rating
                    const stars = $(`
                        <i class="fa-solid fa-star" id=${x} style="padding:10px 0px"></i>
                        <i class="fa-solid fa-star" id=${x} style="padding:10px 0px"></i>
                        <i class="fa-solid fa-star" id=${x} style="padding:10px 0px"></i>
                        <i class="fa-solid fa-star" id=${x} style="padding:10px 0px"></i>
                        <i class="fa-solid fa-star" id=${x} style="padding:10px 0px"></i>
                    `);
                    for(let i = 0; i <stars.length; i += 2) {
                        stars[i].addEventListener('click', (e) => {
                            for(let j = 0; j < stars.length; j += 2) {
                                i >= j ? stars[j].classList.add('active') : stars[j].classList.remove('active')
                            }
                        });
                    }

                    const viewComments = $(`<input type="button" class="btn btn-outline-info" name="view-comments" id=${element} value="View Comments">`);
                    viewComments.click({movie: element}, (eV) => window.location.href = "/comments/" + eV.data.movie.title);

                    const fieldset = $('<fieldset/>', {id:x}).css("border",'0');

                    const li = $('<li/>').text(element.title);

                    divStars.append(stars);
                    diventry.append(li);
                    diventry.append(inputElement)
                    diventry.append(divStars);
                    diventry.append(viewComments);
                    fieldset.append(diventry);
                    ulList.append(fieldset);
                    x+=1;
                });
                
                values = fields_append()
                $('#recos').append(values[0])
                $('#recos').append(values[1])

                // const li = $('<li/>').text()
                $('#feedback').prop('disabled', false)
                console.log("->", response['recommendations']);
                $('#loader').hide();
            

            },
            error: function (error) {
                console.log("ERROR ->" + error );
                $('#loader').hide();
            }
        });

        

    });

    $('#feedback').click(function(){
        const myForm = $('fieldset');
        const data = {};

        for(let i=0;i<myForm.length;i++){
            const input = $(`#${i}`).find('.active').length;
            const movieName = $(`#${i}`).find('div').find('li')[0].innerText;
            const comment = document.getElementById(`${movieName}`).value
            data[movieName]=[input,comment];
        }
        data["username"] = document.getElementById(`username`).value
        data["emailId"] = document.getElementById(`emailId`).value
        console.log(data);

        if (data["emailId"].length > 0 && data["username"].length > 0){

            $.ajax({
                type: "POST",
                url: "/feedback",
                dataType: "json",
                contentType: "application/json;charset=UTF-8",
                traditional: "true",
                cache: false,
                data: JSON.stringify(data),
                success: function (response) {
                    $('#success-alert').show();
                    window.setTimeout(function () {
                        // Reload window in 1.5 secs
                        window.location.reload()
                    }, 1500);
                },
                error: function (error) {
                    console.log("ERROR ->" + error );
                }
            });
        }   
        else{
            $('#fail-alert').show();
        }
    });
});

const removeElement = (event) => {
    const id = event.data.id
    for (let i=0;i<event.data.ulList[0].children.length;i++) {
        if (event.data.ulList[0].children[i].id === id) {
            event.data.ulList[0].children[i].remove()
            event.data.ulList.splice(i, 1);
        }
    }
}

const fields_append = ()=>{
    const username = $('<input>', {
        type: 'text',      // Input type
        id: "username",     // Input ID
        name: "usernameElement",   // Input name
        value:'',
        placeholder: 'Username',
    }).css({
        'border':'1px solid black',
        'border-left':'none',
        'border-right':'none',
        'border-top':'none',
        'background':'none',
        'outline':'none',
    });


    const emailId = $('<input>', {
        type: 'text',      // Input type
        id: "emailId",     // Input ID
        name: "emailIdElement",   // Input name
        value:'',
        placeholder: 'Email ID',
    }).css({
        'border':'1px solid black',
        'border-left':'none',
        'border-right':'none',
        'border-top':'none',
        'background':'none',
        'outline':'none',
        'display':'block',
        'margin':'10px 0px',
    });

    return [username,emailId]
}