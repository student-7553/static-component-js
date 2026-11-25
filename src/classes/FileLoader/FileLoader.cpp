#include "iostream"
#include "string"
#include "unordered_map"
#include "FileLoader.hpp"
#include "filesystem"

using namespace std;
using namespace filesystem;

struct FilesAndFolders
{
    vector<ComponentFile> files;
    vector<path> folders;
};

FilesAndFolders listFilesAndFolders(const string &folder)
{
    FilesAndFolders results;
    for (const auto &entry : directory_iterator(folder))
    {
        if (entry.is_regular_file())
        {
            results.files.push_back(
                ComponentFile{
                    .filePath = entry.path(),
                    .fileName = entry.path().filename(),
                    .fileExtension = entry.path().extension()});
        }
        else if (entry.is_directory())
        {
            results.folders.push_back(entry.path());
        }
    }
    return results;
}

void extractAllComponentFileFromFolder(unordered_map<string, ComponentFile> &allFiles, string targetFolderPath)
{
    FilesAndFolders folderResult = listFilesAndFolders(targetFolderPath);
    for (const ComponentFile &componentFile : folderResult.files)
    {
        if (allFiles.count(componentFile.fileName))
        {
            continue;
        }
        allFiles[componentFile.fileName] = componentFile;
    }

    for (const string &folderPath : folderResult.folders)
    {
        extractAllComponentFileFromFolder(allFiles, folderPath);
    }
}

FileLoader::FileLoader(string _rootFolderPath)
{
    rootFolderPath = _rootFolderPath;
};

void FileLoader::init()
{
    unordered_map<string, ComponentFile> allFiles;
    extractAllComponentFileFromFolder(allFiles, this->rootFolderPath);

    for (auto [key, value] : allFiles)
    {
        componentFiles.push_back(value);
    }

}

vector<ComponentFile> *FileLoader::getFiles()
{
    return &(this->componentFiles);
};
