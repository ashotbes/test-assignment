import {useEffect, useState} from 'react';
import axios from 'axios';

const Posts = () => {
    const [posts, setPosts] = useState(() => {
        const savedPosts = localStorage.getItem('posts');
        return savedPosts ? JSON.parse(savedPosts) : [];
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [perPage, setPerPage] = useState(() => {
        const savedPerPage = localStorage.getItem('per_page');
        return savedPerPage ? parseInt(savedPerPage, 10) : 10;
    });
    const [isCommentsActive, setIsCommentsActive] = useState({});
    const [isFavActive, setIsFavActive] = useState(null);
    const [deletedPosts, setDeletedPosts] = useState(() => {
        const deletedPosts = localStorage.getItem('deleted_posts');
        return deletedPosts ? JSON.parse(deletedPosts) : [];
    });
    const [showConfirmation, setShowConfirmation] = useState(null);
    const [selectedPosts, setSelectedPosts] = useState(() => {
        const savedSelectedPosts = localStorage.getItem('selected_posts');
        return savedSelectedPosts ? JSON.parse(savedSelectedPosts) : [];
    });
    const [isEditing, setIsEditing] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedBody, setEditedBody] = useState('');


    const fetchPosts = async (page) => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${perPage}`
            );
            const postsData = await Promise.all(
                response.data.map(async (post) => {
                    const userResponse = await axios.get(
                        `https://jsonplaceholder.typicode.com/users/${post.userId}`
                    );
                    const userData = userResponse.data;
                    return {
                        ...post,
                        user: userData,
                    };
                })
            );
            const filteredPosts = postsData.filter(
                (post) => !deletedPosts.includes(post.id)
            );
            setPosts(filteredPosts);
            const totalCount = response.headers['x-total-count'];
            setTotalPages(Math.ceil(totalCount / perPage));
            setIsLoading(false);

            localStorage.setItem('posts', JSON.stringify(filteredPosts)); // Сохранение отфильтрованных постов в localStorage
        } catch (error) {
            console.error(error);
        }
    };

    const fetchComments = async (postId) => {
        try {
            const response = await axios.get(
                `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
            );
            const updatedPosts = posts.map((post) => {
                if (post.id === postId) {
                    return {
                        ...post,
                        comments: response.data,
                    };
                }
                return post;
            });
            setPosts(updatedPosts);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPosts(currentPage);
    }, [currentPage, perPage]);

    useEffect(() => {
        localStorage.setItem('deleted_posts', JSON.stringify(deletedPosts));
    }, [deletedPosts]);

    useEffect(() => {
        localStorage.setItem('selected_posts', JSON.stringify(selectedPosts));
    }, [selectedPosts]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleCommentsToggle = async (postId) => {
        setIsCommentsActive((prevState) => ({
            ...prevState,
            [postId]: !prevState[postId]
        }));

        if (!isCommentsActive[postId]) {
            await fetchComments(postId);
        }
    };

    const handlePerPageChange = (event) => {
        const newPerPage = parseInt(event.target.value, 10);
        setPerPage(newPerPage);
        localStorage.setItem('per_page', newPerPage.toString());
    };

    const handleDeletePost = (postId) => {
        setShowConfirmation(postId);
    };

    const handleConfirmDelete = () => {
        const updatedPosts = posts.filter((post) => post.id !== showConfirmation);
        setPosts(updatedPosts);
        setDeletedPosts((prevDeletedPosts) => [
            ...prevDeletedPosts,
            showConfirmation,
        ]);

        localStorage.setItem('deleted_posts', JSON.stringify([...deletedPosts, showConfirmation]));
        localStorage.setItem('selected_posts', JSON.stringify(selectedPosts));
        setShowConfirmation(null);
    };

    const handleCancelDelete = () => {
        setShowConfirmation(null);
    };

    const toggleFavorite = (postId) => {
        setSelectedPosts((prevSelectedPosts) => {
            const isSelected = prevSelectedPosts.includes(postId);
            if (isSelected) {
                return prevSelectedPosts.filter((id) => id !== postId);
            } else {
                return [...prevSelectedPosts, postId];
            }
        });
        localStorage.setItem('selected_posts', JSON.stringify(selectedPosts));
    };

    const editComment = async (commentId, updatedComment) => {
        try {
            const response = await fetch(`https://jsonplaceholder.typicode.com/comments/${commentId}`, {
                method: 'PUT',
                body: JSON.stringify(updatedComment),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8',
                },
            });

            if (!response.ok) {
                throw new Error('Не удалось изменить комментарий');
            }

            const data = await response.json();
            console.log('Измененный комментарий:', data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div
            className='flex flex-col h-screen bg-white rounded-lg gap-10 md:mx-auto max-w-md md:max-w-full gap-y-8 pt-16 pb-5'>
            <div className='flex justify-center items-center '>
                <label htmlFor='per-page' className='mr-2 text-[20px]'>
                    Posts per page:
                </label>
                <select
                    id='per-page'
                    className='border border-gray-300 rounded-md p-2'
                    value={perPage}
                    onChange={handlePerPageChange}
                >
                    <option value='10'>10</option>
                    <option value='20'>20</option>
                    <option value='50'>50</option>
                    <option value='100'>100</option>
                    <option value='-1'>All</option>
                </select>
            </div>

            {isLoading ? (
                <div className='flex justify-center items-center'>
                    <div className='loader'>
                        <div role="status">
                            <svg aria-hidden="true"
                                 className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                 viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"/>
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"/>
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            ) : (
                posts.map((post) => (
                        <div className='gap-[7px] flex text-center items-center justify-center flex-col relative'
                             key={post.id}>
                            <h2 className='text-xl'>Title: {post.title}</h2>
                            <p>Posted by: {post.user.name}</p>
                            <p>Post: {post.body}</p>
                            <div className='flex gap-12 mt-[18px]'>
                                <button onClick={() => handleCommentsToggle(post.id)}>
                                    {isCommentsActive[post.id] ? (
                                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                             xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 20 18">
                                            <path
                                                d="M18 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3.546l3.2 3.659a1 1 0 0 0 1.506 0L13.454 14H18a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-8 10H5a1 1 0 0 1 0-2h5a1 1 0 1 1 0 2Zm5-4H5a1 1 0 0 1 0-2h10a1 1 0 1 1 0 2Z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                             xmlns="http://www.w3.org/2000/svg" fill="black" viewBox="0 0 20 18">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                                  strokeWidth="2"
                                                  d="M5 5h9M5 9h5m8-8H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4l3.5 4 3.5-4h5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"></path>
                                        </svg>
                                    )}
                                </button>
                                <button onClick={() => editComment(post.id)}>
                                    <svg className='w-[24px] h-[24px]' xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                         width="64" height="64"
                                         viewBox="0 0 128 128">
                                        <path
                                            d="M 79.335938 15.667969 C 78.064453 15.622266 76.775 15.762109 75.5 16.099609 C 72.1 16.999609 69.299609 19.199219 67.599609 22.199219 L 64 28.699219 C 63.2 30.099219 63.699609 32.000781 65.099609 32.800781 L 82.400391 42.800781 C 82.900391 43.100781 83.400391 43.199219 83.900391 43.199219 C 84.200391 43.199219 84.399219 43.199609 84.699219 43.099609 C 85.499219 42.899609 86.1 42.399219 86.5 41.699219 L 90.199219 35.199219 C 91.899219 32.199219 92.4 28.700781 91.5 25.300781 C 90.6 21.900781 88.400391 19.100391 85.400391 17.400391 C 83.525391 16.337891 81.455078 15.744141 79.335938 15.667969 z M 60.097656 38.126953 C 59.128906 38.201172 58.199219 38.724609 57.699219 39.599609 L 27.5 92 C 24.1 97.8 22.200781 104.30039 21.800781 110.90039 L 21 123.80078 C 20.9 124.90078 21.5 125.99961 22.5 126.59961 C 23 126.89961 23.5 127 24 127 C 24.6 127 25.199219 126.8 25.699219 126.5 L 36.5 119.40039 C 42 115.70039 46.7 110.8 50 105 L 80.300781 52.599609 C 81.100781 51.199609 80.599219 49.3 79.199219 48.5 C 77.799219 47.7 75.899609 48.199609 75.099609 49.599609 L 44.800781 102 C 41.900781 106.9 37.899609 111.20039 33.099609 114.40039 L 27.300781 118.19922 L 27.699219 111.30078 C 27.999219 105.60078 29.699609 100 32.599609 95 L 62.900391 42.599609 C 63.700391 41.199609 63.200781 39.3 61.800781 38.5 C 61.275781 38.2 60.678906 38.082422 60.097656 38.126953 z M 49 121 C 47.3 121 46 122.3 46 124 C 46 125.7 47.3 127 49 127 L 89 127 C 90.7 127 92 125.7 92 124 C 92 122.3 90.7 121 89 121 L 49 121 z M 104 121 A 3 3 0 0 0 101 124 A 3 3 0 0 0 104 127 A 3 3 0 0 0 107 124 A 3 3 0 0 0 104 121 z"></path>
                                    </svg>
                                </button>
                                <button onClick={() => handleDeletePost(post.id)}
                                        disabled={showConfirmation !== null}
                                >
                                    <svg className='w-[24px] h-[24px]' xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                                         width="48" height="48" viewBox="0 0 48 48">
                                        <path
                                            d="M 20.5 4 A 1.50015 1.50015 0 0 0 19.066406 6 L 14.640625 6 C 12.803372 6 11.082924 6.9194511 10.064453 8.4492188 L 7.6972656 12 L 7.5 12 A 1.50015 1.50015 0 1 0 7.5 15 L 8.2636719 15 A 1.50015 1.50015 0 0 0 8.6523438 15.007812 L 11.125 38.085938 C 11.423352 40.868277 13.795836 43 16.59375 43 L 31.404297 43 C 34.202211 43 36.574695 40.868277 36.873047 38.085938 L 39.347656 15.007812 A 1.50015 1.50015 0 0 0 39.728516 15 L 40.5 15 A 1.50015 1.50015 0 1 0 40.5 12 L 40.302734 12 L 37.935547 8.4492188 C 36.916254 6.9202798 35.196001 6 33.359375 6 L 28.933594 6 A 1.50015 1.50015 0 0 0 27.5 4 L 20.5 4 z M 14.640625 9 L 33.359375 9 C 34.196749 9 34.974746 9.4162203 35.439453 10.113281 L 36.697266 12 L 11.302734 12 L 12.560547 10.113281 A 1.50015 1.50015 0 0 0 12.5625 10.111328 C 13.025982 9.4151428 13.801878 9 14.640625 9 z M 11.669922 15 L 36.330078 15 L 33.890625 37.765625 C 33.752977 39.049286 32.694383 40 31.404297 40 L 16.59375 40 C 15.303664 40 14.247023 39.049286 14.109375 37.765625 L 11.669922 15 z"></path>
                                    </svg>
                                </button>
                                {showConfirmation === post.id && (
                                    <div className="confirmation-modal">
                                        <p>Вы уверены, что хотите удалить этот пост?</p>
                                        <div className="confirmation-modal-btns">
                                            <button onClick={() => handleConfirmDelete(post.id)}>Да</button>
                                            <button onClick={() => handleCancelDelete()}>Нет</button>
                                        </div>
                                    </div>
                                )}
                                <button onClick={() => toggleFavorite(post.id)}>
                                    {selectedPosts.includes(post.id) ?
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="yellow"
                                             stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                             stroke-linejoin="round" width="24" height="24">
                                            <path
                                                d="M12 2L8.3 9.4H1l6.2 4.5L4.7 22 12 17.3l7.3 4.7-2.5-8.1L23 9.4h-7.3L12 2z"/>
                                        </svg>
                                        :
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                             stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                             stroke-linejoin="round" width="24" height="24">
                                            <path
                                                d="M12 2L8.3 9.4H1l6.2 4.5L4.7 22 12 17.3l7.3 4.7-2.5-8.1L23 9.4h-7.3L12 2z"/>
                                        </svg>
                                    }
                                </button>
                            </div>
                            {isCommentsActive[post.id] && post.comments && (
                                post.comments.map((comment) => (
                                    <div className='flex flex-col gap-[10px] pt-6' key={comment.id}>
                                        <div className='flex flex-col gap-1 text-[16px] bg-violet-100' key={comment.id}>
                                            <p className='mb-3 text-black-800 text-[20px]'> Name: {comment.name}</p>
                                            <p><span
                                                className='mb-3 text-black-800 text-[22px]'>Email:</span> {comment.email}
                                            </p>
                                            <p><span
                                                className='mb-3 text-black-800 text-[22px]'>Comment: </span>{comment.body}
                                            </p>
                                        </div>
                                    </div>
                                )))}
                        </div>
                    )
                ))}

            <div className='flex justify-center gap-12 pb-5'>
                {Array.from({length: totalPages}, (_, index) => index + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`mx-1 ${
                            page === currentPage ? 'bg-amber-50 text-black w-12 h-12' : 'bg-gray-200 w-12 h-12'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Posts;
