import React, {useEffect, useState} from 'react';
import axios from 'axios';

const Photos = () => {
    const [albums, setAlbums] = useState([]);
    const [photos, setPhotos] = useState([]);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            const response = await axios.get('https://jsonplaceholder.typicode.com/photos');
            setAlbums(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handlePageSizeChange = (event) => {
        setPageSize(parseInt(event.target.value));
    };

    const fetchPhotos = async (albumId) => {
        try {
            const response = await axios.get(`https://jsonplaceholder.typicode.com/photos?albumId=${albumId}`);
            const photos = response.data;
            setPhotos(photos);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAlbumClick = (albumId) => {
        fetchPhotos(albumId);
    };

    const filteredAlbums = albums.filter((album) => {
        // Фильтрация альбомов по вашей логике (например, по названию или имени пользователя)
        return true;
    });

    const sortedAlbums = filteredAlbums.sort((a, b) => {
        // Сортировка альбомов по вашей логике
        return 0;
    });

    const paginatedAlbums = sortedAlbums.slice(0, pageSize);

    return (
        <div>
            <h1 className='flex items-center justify-center'>Альбомы</h1>
            <label className='flex items-center justify-center'>
                Количество на странице:
                <select value={pageSize} onChange={handlePageSizeChange}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={sortedAlbums.length}>Все</option>
                </select>
            </label>
            <ul className='flex items-center justify-center flex-col gap-6 pt[12px] mt-[20px]'>
                {paginatedAlbums.map((album) => (
                    <li key={album.id}>
                        <span onClick={() => handleAlbumClick(album.id)} style={{cursor: 'pointer'}}>
                            {album.title}
                        </span>
                        {album.user && <span>{album.user.name}</span>}
                        <div className="confirmation-modal-btns">
                            <button>Редактировать</button>
                            <button>Удалить</button>
                            <button>В избранное</button>
                            <input type="checkbox"/>
                        </div>
                        <div className='images'>
                            {photos.map((photo) => (
                                <img key={photo.id} src={photo.url} alt={photo.title}/>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Photos;